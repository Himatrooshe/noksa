/**
 * A minimal, dependency-free "signed cookie" session for the dashboard: one
 * shared email + password pair (ADMIN_EMAIL / ADMIN_PASSWORD), no per-user
 * accounts, no signup. The cookie value is `<expiry>.<hmac>`; the HMAC
 * proves the expiry wasn't tampered with and that it was issued by this
 * server (ADMIN_SESSION_SECRET), without storing any session state
 * server-side.
 *
 * Uses the Web Crypto API (globalThis.crypto.subtle) rather than
 * node:crypto so this works unchanged whether middleware.ts runs on the
 * Node.js or the Edge runtime.
 */
export const ADMIN_SESSION_COOKIE = "noksaboard_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "Missing required environment variable: ADMIN_SESSION_SECRET. Set it to a long random string (see docs/ADMIN_SETUP.md).",
    );
  }
  return secret;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  const keyData = new TextEncoder().encode(getSessionSecret());
  return crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
}

async function sign(value: string): Promise<string> {
  const key = await getHmacKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toHex(signature);
}

/** Constant-time-ish comparison: always walks every byte, no early exit. */
function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const expiry = String(Date.now() + SESSION_DURATION_MS);
  return `${expiry}.${await sign(expiry)}`;
}

export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [expiry, signature] = token.split(".");
  if (!expiry || !signature) return false;
  if (Date.now() > Number(expiry)) return false;

  const expected = await sign(expiry);
  return bytesEqual(fromHex(expected), fromHex(signature));
}

function requireLoginEnv(name: "ADMIN_EMAIL" | "ADMIN_PASSWORD"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name} (see docs/ADMIN_SETUP.md).`);
  }
  return value;
}

/** Both the email and password must match; either check uses a full,
 * constant-time byte comparison (no early-exit on length), to avoid
 * leaking which field was wrong (or how much of it matched) via timing. */
export function checkCredentials(candidateEmail: string, candidatePassword: string): boolean {
  const expectedEmail = requireLoginEnv("ADMIN_EMAIL").trim().toLowerCase();
  const expectedPassword = requireLoginEnv("ADMIN_PASSWORD");

  const emailMatches = bytesEqual(
    new TextEncoder().encode(candidateEmail.trim().toLowerCase()),
    new TextEncoder().encode(expectedEmail),
  );
  const passwordMatches = bytesEqual(
    new TextEncoder().encode(candidatePassword),
    new TextEncoder().encode(expectedPassword),
  );
  return emailMatches && passwordMatches;
}
