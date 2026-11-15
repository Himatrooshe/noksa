import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { imagekitConfig, uploadImage } from "../src/lib/imagekit-upload.mjs";

// Run with Node 22: node --env-file=.env.local scripts/migrate-images-to-imagekit.mjs [--apply]
imagekitConfig();
const sql = neon(process.env.DATABASE_URL);
const apply = process.argv.includes("--apply");
const directory = path.resolve("backups/imagekit-migration");
// Fetch small pages: large base64 result sets can be interrupted in transit.
const media = [];
let cursor = "00000000-0000-0000-0000-000000000000";
while (true) {
  const page = await sql`select id,url from product_media where url like 'data:image/%' and id > ${cursor}::uuid order by id limit 4`;
  if (!page.length) break;
  media.push(...page);
  cursor = page.at(-1).id;
}
const collections = await sql`select id,image_url as url from collections where image_url like 'data:image/%'`;
const records = [...media.map(row => ({ ...row, table: "product_media" })), ...collections.map(row => ({ ...row, table: "collections" }))];
const unique = new Map();
for (const record of records) {
  if (!/^data:image\/(?:png|jpeg|webp|gif|avif);base64,[a-z0-9+/=]+$/i.test(record.url)) throw new Error("Invalid embedded image; no references have been changed.");
  const bytes = Buffer.from(record.url.slice(record.url.indexOf(",") + 1), "base64");
  const hash = createHash("sha256").update(bytes).digest("hex");
  record.hash = hash;
  unique.set(hash, bytes);
}
console.log(JSON.stringify({ mode: apply ? "migrate" : "dry-run", mediaReferences: media.length, collectionReferences: collections.length, uniqueFiles: unique.size, embeddedBytes: records.reduce((sum, row) => sum + Buffer.byteLength(row.url), 0) }));
if (!apply || records.length === 0) process.exit(0);
await fs.mkdir(directory, { recursive: true });
const backupPath = path.join(directory, `before-${Date.now()}.json`);
await fs.writeFile(backupPath, JSON.stringify(records), { mode: 0o600 });
const checkpointPath = path.join(directory, "uploads.json");
let checkpoint = {};
try { checkpoint = JSON.parse(await fs.readFile(checkpointPath, "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }

async function verify(url) {
  const original = new URL(url);
  original.searchParams.set("tr", "orig-true");
  const response = await fetch(original, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) throw new Error("An uploaded image could not be verified; database references remain unchanged.");
  const bytes = Buffer.from(await response.arrayBuffer());
  return createHash("sha256").update(bytes).digest("hex");
}

for (const [hash, bytes] of unique) {
  const image = checkpoint[hash] ?? await uploadImage(bytes, { folder: "/noksa/catalog", deterministic: true });
  checkpoint[hash] = image;
  await fs.writeFile(checkpointPath, JSON.stringify(checkpoint, null, 2), { mode: 0o600 });
  // Verify the complete file, not only an HTTP HEAD response.
  const actualHash = await verify(image.url);
  if (actualHash !== hash) throw new Error("Image content mismatch; database references remain unchanged.");
  console.log(`Verified ${Object.keys(checkpoint).length}/${unique.size} images`);
}

// Compare the old URL in each update so an editor's concurrent changes win.
const updates = records.map(record => {
  const url = checkpoint[record.hash].url;
  return record.table === "product_media"
    ? sql`update product_media set url=${url} where id=${record.id} and url=${record.url} returning id`
    : sql`update collections set image_url=${url} where id=${record.id} and image_url=${record.url} returning id`;
});
const results = await sql.transaction(updates);
const remaining = await sql`select (select count(*) from product_media where url like 'data:image/%')::int as media,(select count(*) from collections where image_url like 'data:image/%')::int as collections`;
console.log(JSON.stringify({ updatedReferences: results.reduce((sum, rows) => sum + rows.length, 0), remainingEmbeddedImages: remaining[0], backupPath, checkpointPath }));
if (remaining[0].media || remaining[0].collections) process.exitCode = 1;
