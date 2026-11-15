#!/usr/bin/env node
// Human-readable mirror of backups/latest/*.json; JSON is the restore source.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { google } from "googleapis";
import { requireEnv, TABLES } from "./fetch-tables.mjs";

export function createSheetsAuth(email, privateKey) {
  return new google.auth.JWT({
    email,
    key: privateKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function enteredValue(value) {
  if (value === null || value === undefined) return {};
  if (typeof value === "boolean") return { boolValue: value };
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Backup contains a non-finite number.");
    return { numberValue: value };
  }
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (text.length > 50000) {
    throw new Error("A backup cell exceeds 50,000 characters. Keep its full value in the JSON backup; use image URLs instead of embedded images for the Sheets mirror.");
  }
  // Explicit strings preserve phone numbers, IDs, and text beginning with '='.
  return { stringValue: text };
}

export function buildMirrorRequests(tables, existingSheets = []) {
  const requests = [];
  const usedIds = new Set(existingSheets.map((sheet) => sheet.sheetId));
  let nextId = 1;
  for (const table of TABLES) {
    const rows = tables[table];
    if (!Array.isArray(rows) || rows.some((row) => !row || typeof row !== "object" || Array.isArray(row))) {
      throw new Error(`Invalid backup data for ${table}: expected an array of records.`);
    }
    const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
    const values = columns.length
      ? [columns, ...rows.map((row) => columns.map((column) => row[column]))]
      : [["(empty)"]];
    const data = values.map((row) => ({
      values: row.map((value) => ({ userEnteredValue: enteredValue(value) })),
    }));
    const existing = existingSheets.find((sheet) => sheet.title === table);
    while (usedIds.has(nextId)) nextId++;
    const sheetId = existing?.sheetId ?? nextId++;
    usedIds.add(sheetId);
    const gridProperties = {
      rowCount: Math.max(existing?.gridProperties?.rowCount ?? 100, data.length),
      columnCount: Math.max(existing?.gridProperties?.columnCount ?? 26, columns.length),
      frozenRowCount: 1,
    };
    if (!existing) {
      requests.push({ addSheet: { properties: { sheetId, title: table, gridProperties } } });
    } else {
      requests.push({ updateSheetProperties: {
        properties: { sheetId, gridProperties }, fields: "gridProperties",
      } });
    }
    // An unbounded range clears stale values outside the supplied rows too.
    // Creation, replacement, and formatting all commit in one atomic API call.
    requests.push({ updateCells: { range: { sheetId }, rows: data, fields: "userEnteredValue" } });
    requests.push({ repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
      cell: { userEnteredFormat: {
        backgroundColor: { red: 0.21, green: 0.29, blue: 0.21 },
        textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
      } },
      fields: "userEnteredFormat.backgroundColor,userEnteredFormat.textFormat",
    } });
  }
  return requests;
}

export async function mirrorBackup(sheets, spreadsheetId, tables) {
  const { data } = await sheets.spreadsheets.get({
    spreadsheetId, fields: "sheets.properties",
  });
  const requests = buildMirrorRequests(tables, (data.sheets ?? []).map((sheet) => sheet.properties));
  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
}

async function main() {
  // Fill missing local values while preserving explicitly supplied CI variables.
  const dotenv = await import("dotenv");
  dotenv.config({ path: ".env.local", quiet: true });
  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");
  const auth = createSheetsAuth(requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL"), requireEnv("GOOGLE_PRIVATE_KEY"));
  const sheets = google.sheets({ version: "v4", auth });
  if (process.argv.includes("--check")) {
    const { data } = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties" });
    console.log(`Google Sheets connection successful (${data.sheets?.length ?? 0} tabs). No data changed.`);
    return;
  }
  const tables = {};
  for (const table of TABLES) {
    tables[table] = JSON.parse(await readFile(path.join("backups", "latest", `${table}.json`), "utf8"));
  }
  await mirrorBackup(sheets, spreadsheetId, tables);
  console.log("Mirrored database tables to Google Sheets:",
    Object.fromEntries(Object.entries(tables).map(([table, rows]) => [table, rows.length])));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("Google Sheets mirror failed:", error.message);
    process.exitCode = 1;
  });
}
