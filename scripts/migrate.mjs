#!/usr/bin/env node
// Applies db/migrations/*.sql in filename order, each in its own
// transaction, recording what ran in a schema_migrations table so every
// file runs exactly once per database.
//
// Usage: npm run db:migrate          (apply pending migrations)
//        npm run db:migrate -- --seed (also run db/seed.sql afterwards)
// Required env: DATABASE_URL (read from .env.local when run locally).
// Needs Node 22+ (uses the global WebSocket for Neon's Pool driver, which,
// unlike the HTTP driver, can run multi-statement SQL files).
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "@neondatabase/serverless";

async function loadLocalEnv() {
  if (process.env.DATABASE_URL) return;
  try {
    const dotenv = await import("dotenv");
    dotenv.config({ path: ".env.local", quiet: true });
  } catch {
    /* dotenv is a devDependency */
  }
}

async function main() {
  await loadLocalEnv();
  if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    // Release jobs may overlap. Serialize migration discovery and application
    // on this session so two deployments cannot apply the same file together.
    await client.query("select pg_advisory_lock(1869572979, 1)");
    await client.query(`
      create table if not exists schema_migrations (
        name text primary key,
        applied_at timestamptz not null default now()
      )`);
    const { rows } = await client.query("select name from schema_migrations");
    const applied = new Set(rows.map((r) => r.name));

    const dir = path.join("db", "migrations");
    const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
    let ran = 0;
    for (const file of files) {
      if (applied.has(file)) continue;
      const sqlText = await readFile(path.join(dir, file), "utf8");
      process.stdout.write(`Applying ${file} ... `);
      try {
        await client.query("begin");
        await client.query(sqlText);
        await client.query("insert into schema_migrations (name) values ($1)", [file]);
        await client.query("commit");
        console.log("done");
        ran++;
      } catch (err) {
        await client.query("rollback");
        console.log("FAILED");
        throw err;
      }
    }
    if (ran === 0) console.log("Database is up to date.");

    if (process.argv.includes("--seed")) {
      await client.query(await readFile(path.join("db", "seed.sql"), "utf8"));
      console.log("Seed data applied.");
    }
  } finally {
    try {
      await client.query("select pg_advisory_unlock(1869572979, 1)");
    } finally {
      client.release();
      await pool.end();
    }
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
