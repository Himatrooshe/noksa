// Shared by scripts/backup-db.mjs and scripts/backup-to-sheets.mjs. Pulls
// every row from the tables we care about for backup purposes, using the
// same DATABASE_URL the app uses (there's no separate service-role concept
// on plain Postgres/Neon — one connection string, full access).
import { neon } from "@neondatabase/serverless";

// Keep in sync with db/migrations. Order is parents-before-children, which is
// also a sensible restore order.
const TABLES = [
  "collections",
  "products",
  "product_media",
  "product_options",
  "product_variants",
  "product_collections",
  "customers",
  "orders",
  "order_items",
  "order_events",
];

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function fetchAllTables() {
  const sql = neon(requireEnv("DATABASE_URL"));
  const result = {};
  for (const table of TABLES) {
    // table comes only from the fixed TABLES list above, never user input,
    // so building the string directly here is safe.
    result[table] = await sql.query(`select * from ${table}`);
  }
  return result;
}

export { TABLES };
