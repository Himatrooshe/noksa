import "server-only";
import { neon } from "@neondatabase/serverless";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env.local and fill it in (see docs/ADMIN_SETUP.md).`,
    );
  }
  return value;
}

/**
 * Tagged-template SQL function backed by Neon's HTTP driver. Values passed
 * through the template (``sql`select * from products where id = ${id}` ``)
 * are sent as query parameters, not interpolated into the query string, so
 * this is safe against SQL injection as long as callers always use the
 * tagged-template form rather than building query strings by hand.
 */
export const sql = neon(requireEnv("DATABASE_URL"));
