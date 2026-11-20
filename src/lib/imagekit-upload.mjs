import { createHash, createHmac, randomUUID } from "node:crypto";

export const MAX_IMAGE_BYTES = 1_500_000;

export function imageExtension(bytes) {
  if (bytes.length < 12) throw new Error("Choose a valid JPG, PNG, WebP, GIF, or AVIF image.");
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "jpg";
  if (["GIF87a", "GIF89a"].includes(bytes.toString("ascii", 0, 6))) return "gif";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (bytes.toString("ascii", 4, 8) === "ftyp" && /avif|avis/.test(bytes.toString("ascii", 8, 32))) return "avif";
  throw new Error("Choose a valid JPG, PNG, WebP, GIF, or AVIF image.");
}

export function imagekitConfig() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const endpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  if (!privateKey || !endpoint) throw new Error("Image uploads are not configured. Set the ImageKit server environment variables.");
  const url = new URL(endpoint);
  if (url.protocol !== "https:") throw new Error("The ImageKit URL endpoint must use HTTPS.");
  return { privateKey, endpoint: url.href.replace(/\/$/, "") };
}

// Server-only callers: never import this module into a Client Component.
export async function uploadImage(bytes, { folder = "/noksa/products", deterministic = false } = {}) {
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error("The optimized image must be smaller than 1.5 MB.");
  const extension = imageExtension(bytes);
  const { privateKey } = imagekitConfig();
  const hash = createHash("sha256").update(bytes).digest("hex");
  const form = new FormData();
  form.set("file", new Blob([bytes]), `${hash}.${extension}`);
  form.set("fileName", `${hash}.${extension}`);
  form.set("folder", folder);
  form.set("useUniqueFileName", deterministic ? "false" : "true");
  // Migration names are content hashes: retrying only replaces identical data.
  form.set("overwriteFile", deterministic ? "true" : "false");
  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}` },
    body: form,
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`Image upload failed (${response.status}). Check the ImageKit configuration or try again.`);
  const result = await response.json();
  if (typeof result.fileId !== "string" || typeof result.url !== "string" || !result.url.startsWith("https://")) {
    throw new Error("ImageKit returned an incomplete upload result.");
  }
  return { fileId: result.fileId, url: result.url, filePath: result.filePath, hash };
}

export const VIDEO_FOLDER = "/noksa/videos";

/**
 * Short-lived credentials that let an authenticated admin's browser upload a
 * video straight to ImageKit. Videos are too large to pass through this app's
 * server; the private key never leaves the server, only an HMAC signature does.
 */
export function videoUploadAuth(now = Date.now()) {
  const { privateKey } = imagekitConfig();
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  if (!publicKey) throw new Error("Video uploads are not configured. Set IMAGEKIT_PUBLIC_KEY.");
  const token = randomUUID();
  const expire = Math.floor(now / 1000) + 30 * 60; // ImageKit allows at most one hour.
  const signature = createHmac("sha1", privateKey).update(token + expire).digest("hex");
  return { token, expire, signature, publicKey, folder: VIDEO_FOLDER };
}

/** Only videos uploaded to this account's ImageKit video folder may be saved. */
export function isOwnVideoUrl(value) {
  try {
    const url = new URL(value);
    const { endpoint } = imagekitConfig();
    return url.protocol === "https:" && !url.username && !url.password && url.search === "" &&
      `${url.origin}${url.pathname}`.startsWith(`${endpoint}${VIDEO_FOLDER}/`);
  } catch {
    return false;
  }
}
