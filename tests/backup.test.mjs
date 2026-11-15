import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { TABLES } from "../scripts/fetch-tables.mjs";
import { buildMirrorRequests, createSheetsAuth, mirrorBackup } from "../scripts/backup-to-sheets.mjs";
import { decryptBackup, encryptBackup } from "../scripts/backup-archive.mjs";

const emptyTables = () => Object.fromEntries(TABLES.map((table) => [table, []]));

test("Google credentials use the installed library's options constructor", () => {
  const auth = createSheetsAuth("backup@example.test", "first\\nsecond");
  assert.equal(auth.email, "backup@example.test");
  assert.equal(auth.key, "first\nsecond");
  assert.deepEqual(auth.scopes, ["https://www.googleapis.com/auth/spreadsheets"]);
});

test("Sheets mirror preserves literal text, types, and nested data", () => {
  const tables = emptyTables();
  tables.products = [{ id: "001", description: "=SUM(A1:A2)", active: true, count: 0, extra: ["jute"], optional: null }];
  const requests = buildMirrorRequests(tables, [{ sheetId: 42, title: "products" }]);
  const update = requests.find((request) => request.updateCells?.range.sheetId === 42).updateCells;
  assert.deepEqual(update.rows[1].values.map((cell) => cell.userEnteredValue), [
    { stringValue: "001" }, { stringValue: "=SUM(A1:A2)" }, { boolValue: true },
    { numberValue: 0 }, { stringValue: '["jute"]' }, {},
  ]);
  // Unbounded replacement removes old values after table shrinkage.
  assert.deepEqual(update.range, { sheetId: 42 });
  assert.equal(update.fields, "userEnteredValue");
});

test("Sheets creates only business tabs and grows existing grids", () => {
  const tables = emptyTables();
  tables.products = Array.from({ length: 1100 }, () => Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`column${i}`, i])));
  const requests = buildMirrorRequests(tables, [
    { sheetId: 1, title: "personal-notes" },
    { sheetId: 2, title: "products", gridProperties: { rowCount: 100, columnCount: 26 } },
  ]);
  const properties = requests.find((request) => request.updateSheetProperties)?.updateSheetProperties.properties;
  assert.deepEqual(properties.gridProperties, { rowCount: 1101, columnCount: 30, frozenRowCount: 1 });
  assert.equal(requests.filter((request) => request.addSheet).length, TABLES.length - 1);
  assert.ok(requests.every((request) => request.updateCells?.range.sheetId !== 1));
  const addedIds = requests.filter((request) => request.addSheet).map((request) => request.addSheet.properties.sheetId);
  assert.equal(new Set(addedIds).size, addedIds.length);
  assert.ok(!addedIds.includes(1) && !addedIds.includes(2));
});

test("Invalid input never causes a Sheets write", async () => {
  let writes = 0;
  const sheets = { spreadsheets: {
    get: async () => ({ data: { sheets: [] } }),
    batchUpdate: async () => { writes++; },
  } };
  const oversized = emptyTables();
  oversized.orders = [{ note: "x".repeat(50001) }];
  await assert.rejects(mirrorBackup(sheets, "test", oversized), /50,000/);
  await assert.rejects(mirrorBackup(sheets, "test", {}), /Invalid backup/);
  assert.equal(writes, 0);
  await mirrorBackup(sheets, "test", emptyTables());
  assert.equal(writes, 1, "all tabs use one batch write");
});

test("Encrypted backups round-trip all tables and use fresh nonces", () => {
  const tables = emptyTables();
  tables.customers = [{ name: "Test customer", phone: "+10000000000" }];
  const key = randomBytes(32).toString("hex");
  const first = encryptBackup(tables, key);
  const second = encryptBackup(tables, key);
  assert.notDeepEqual(first, second);
  assert.ok(!first.includes(Buffer.from("Test customer")));
  assert.deepEqual(decryptBackup(first, key).tables, tables);
});

test("Wrong keys, tampering, incomplete archives, and missing tables fail", () => {
  const key = randomBytes(32).toString("hex");
  const archive = encryptBackup(emptyTables(), key);
  assert.throws(() => decryptBackup(archive, randomBytes(32).toString("hex")));
  const tampered = Buffer.from(archive);
  tampered[tampered.length - 1] ^= 1;
  assert.throws(() => decryptBackup(tampered, key));
  assert.throws(() => decryptBackup(archive.subarray(0, 10), key));
  assert.throws(() => encryptBackup(emptyTables(), "short"), /64 hexadecimal/);
  assert.throws(() => encryptBackup({}, key), /Missing or invalid backup table/);
});
