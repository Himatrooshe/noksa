#!/usr/bin/env node
// Dumps the business tables listed in fetch-tables.mjs to JSON files
// under backups/. This is the restorable backup layer: the free Neon tier
// can suspend compute when idle, so this file is what you'd actually load
// back in (vs. backup-to-sheets.mjs, which is just a human-readable mirror).
//
// Usage:
//   node scripts/backup-db.mjs
// Required env: DATABASE_URL
// (loaded from .env.local automatically when run locally; GitHub Actions
// supplies it as a repository secret — see .github/workflows/backup.yml)
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchAllTables } from "./fetch-tables.mjs";

async function loadLocalEnv() {
  // Only needed for local runs; GitHub Actions sets env vars directly.
  if (process.env.DATABASE_URL) return;
  try {
    const dotenv = await import("dotenv");
    dotenv.config({ path: ".env.local", quiet: true });
  } catch {
    /* dotenv is a devDependency; ignore if unavailable in prod installs */
  }
}

async function main() {
  await loadLocalEnv();
  const tables = await fetchAllTables();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const latestDir = path.join("backups", "latest");
  const timestampedDir = path.join("backups", timestamp);

  for (const dir of [latestDir, timestampedDir]) {
    await mkdir(dir, { recursive: true });
    for (const [table, rows] of Object.entries(tables)) {
      await writeFile(path.join(dir, `${table}.json`), JSON.stringify(rows, null, 2) + "\n");
    }
  }

  const counts = Object.fromEntries(
    Object.entries(tables).map(([table, rows]) => [table, rows.length]),
  );
  console.log(`Backed up to ${latestDir} and ${timestampedDir}:`, counts);
}

main().catch((err) => {
  console.error("Backup failed:", err.message);
  process.exitCode = 1;
});
