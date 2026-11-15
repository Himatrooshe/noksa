const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const source = readFileSync(path.join(__dirname, "../src/lib/chunk-recovery.ts"), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const exportsObject = {};
vm.runInNewContext(outputText, { exports: exportsObject });
const { claimChunkReload } = exportsObject;
const chunkError = { name: "ChunkLoadError", message: "Loading chunk app/(storefront)/refund-policy/page failed." };

function storage() {
  const entries = new Map();
  return { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
}

test("recovers a failed chunk once, including after a remount or reload", () => {
  const session = storage();
  const url = "http://localhost:3000/refund-policy";
  assert.equal(claimChunkReload(chunkError, session, url, 100_000), true);
  assert.equal(claimChunkReload(chunkError, session, url, 100_000), false);
  assert.equal(claimChunkReload(chunkError, session, url, 159_999), false);
  assert.equal(claimChunkReload(chunkError, session, url, 160_000), true);
});

test("allows another route to recover and recognizes chunk errors by message", () => {
  const session = storage();
  assert.equal(claimChunkReload(chunkError, session, "/refund-policy", 100_000), true);
  assert.equal(claimChunkReload({ name: "Error", message: "Loading chunk 123 failed." }, session, "/privacy-policy", 100_000), true);
});

test("does not automatically reload application errors or loop without session storage", () => {
  assert.equal(claimChunkReload(new Error("Database unavailable"), storage(), "/shop"), false);
  const disabled = { getItem() { throw new Error("Storage disabled"); }, setItem() {} };
  assert.equal(claimChunkReload(chunkError, disabled, "/refund-policy"), false);
  const readOnly = { getItem: () => null, setItem() { throw new Error("Quota exceeded"); } };
  assert.equal(claimChunkReload(chunkError, readOnly, "/refund-policy"), false);
});
