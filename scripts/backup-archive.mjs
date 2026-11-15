#!/usr/bin/env node
// Authenticated encryption for restorable backups stored in a public repository.
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { TABLES } from "./fetch-tables.mjs";

const MAGIC = Buffer.from("NOKSA_BACKUP_V1\n");
const DEFAULT_ARCHIVE = "backups/encrypted/latest.json.enc";

function encryptionKey(value) {
  if (!/^[a-f0-9]{64}$/i.test(value ?? "")) {
    throw new Error("BACKUP_ENCRYPTION_KEY must contain exactly 64 hexadecimal characters. Keep a separate recovery copy.");
  }
  return Buffer.from(value, "hex");
}

function validateTables(tables) {
  for (const table of TABLES) {
    if (!Array.isArray(tables?.[table])) throw new Error(`Missing or invalid backup table: ${table}`);
  }
}

export function encryptBackup(tables, secret) {
  validateTables(tables);
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(secret), nonce);
  cipher.setAAD(MAGIC);
  const payload = JSON.stringify({ version: 1, createdAt: new Date().toISOString(), tables });
  const ciphertext = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  return Buffer.concat([MAGIC, nonce, cipher.getAuthTag(), ciphertext]);
}

export function decryptBackup(archive, secret) {
  if (archive.length <= MAGIC.length + 28 || !archive.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw new Error("Unsupported or incomplete encrypted backup.");
  }
  const start = MAGIC.length;
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(secret), archive.subarray(start, start + 12));
  decipher.setAAD(MAGIC);
  decipher.setAuthTag(archive.subarray(start + 12, start + 28));
  const payload = Buffer.concat([decipher.update(archive.subarray(start + 28)), decipher.final()]);
  const backup = JSON.parse(payload.toString("utf8"));
  if (backup.version !== 1) throw new Error("Unsupported backup version.");
  validateTables(backup.tables);
  return backup;
}

async function main() {
  const dotenv = await import("dotenv");
  dotenv.config({ path: ".env.local", quiet: true });
  const secret = process.env.BACKUP_ENCRYPTION_KEY;
  encryptionKey(secret);
  if (process.argv.includes("--decrypt")) {
    const argument = (name, fallback) => {
      const index = process.argv.indexOf(name);
      if (index < 0) return fallback;
      if (!process.argv[index + 1] || process.argv[index + 1].startsWith("--")) {
        throw new Error(`Missing value for ${name}`);
      }
      return process.argv[index + 1];
    };
    const input = argument("--input", DEFAULT_ARCHIVE);
    const output = argument("--output", "backups/restored");
    // Authenticate the complete archive before writing any restored data.
    const backup = decryptBackup(await readFile(input), secret);
    await mkdir(path.dirname(output), { recursive: true });
    await mkdir(output); // Refuse to overwrite an existing restore directory.
    for (const table of TABLES) {
      await writeFile(path.join(output, `${table}.json`), JSON.stringify(backup.tables[table], null, 2) + "\n", { mode: 0o600 });
    }
    console.log(`Decrypted ${TABLES.length} tables to ${output}. No database changes made.`);
    return;
  }
  const tables = {};
  for (const table of TABLES) {
    tables[table] = JSON.parse(await readFile(path.join("backups/latest", `${table}.json`), "utf8"));
  }
  const archive = encryptBackup(tables, secret);
  await mkdir(path.dirname(DEFAULT_ARCHIVE), { recursive: true });
  const temporary = `${DEFAULT_ARCHIVE}.tmp`;
  await writeFile(temporary, archive, { mode: 0o600 });
  await rename(temporary, DEFAULT_ARCHIVE);
  console.log(`Encrypted ${TABLES.length} tables to ${DEFAULT_ARCHIVE}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("Backup archive failed:", error.message);
    process.exitCode = 1;
  });
}
