import test from "node:test";
import assert from "node:assert/strict";
import { imageExtension, uploadImage, MAX_IMAGE_BYTES } from "../src/lib/imagekit-upload.mjs";

const image = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aGv8AAAAASUVORK5CYII=", "base64");

test("accepts raster image signatures and rejects disguised text/SVG", () => {
  assert.equal(imageExtension(image), "png");
  assert.throws(() => imageExtension(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')), /valid/);
  assert.throws(() => imageExtension(Buffer.from("not an image despite a .png name")), /valid/);
});

test("rejects oversized uploads before contacting ImageKit", async () => {
  await assert.rejects(uploadImage(Buffer.alloc(MAX_IMAGE_BYTES + 1)), /1.5 MB/);
});

test("uses server authentication and returns only public media metadata", async () => {
  const original = { fetch: globalThis.fetch, key: process.env.IMAGEKIT_PRIVATE_KEY, endpoint: process.env.IMAGEKIT_URL_ENDPOINT };
  process.env.IMAGEKIT_PRIVATE_KEY = "test-private-key";
  process.env.IMAGEKIT_URL_ENDPOINT = "https://ik.imagekit.io/test";
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "https://upload.imagekit.io/api/v1/files/upload");
      assert.equal(options.headers.Authorization, `Basic ${Buffer.from("test-private-key:").toString("base64")}`);
      assert.equal(options.body.get("folder"), "/noksa/products");
      assert.equal(options.body.get("file").size, image.length);
      return Response.json({ fileId: "file-123", url: "https://ik.imagekit.io/test/photo.png", filePath: "/photo.png" });
    };
    const result = await uploadImage(image);
    assert.equal(result.fileId, "file-123");
    assert.equal(result.url, "https://ik.imagekit.io/test/photo.png");
    assert.ok(!JSON.stringify(result).includes("test-private-key"));
    globalThis.fetch = async () => new Response("private upstream error", { status: 401 });
    await assert.rejects(uploadImage(image), error => error.message.includes("401") && !error.message.includes("private upstream"));
  } finally {
    globalThis.fetch = original.fetch;
    if (original.key === undefined) delete process.env.IMAGEKIT_PRIVATE_KEY; else process.env.IMAGEKIT_PRIVATE_KEY = original.key;
    if (original.endpoint === undefined) delete process.env.IMAGEKIT_URL_ENDPOINT; else process.env.IMAGEKIT_URL_ENDPOINT = original.endpoint;
  }
});

test("signs direct video uploads without exposing the private key", async () => {
  const { videoUploadAuth } = await import("../src/lib/imagekit-upload.mjs");
  const { createHmac } = await import("node:crypto");
  const saved = { key: process.env.IMAGEKIT_PRIVATE_KEY, pub: process.env.IMAGEKIT_PUBLIC_KEY, endpoint: process.env.IMAGEKIT_URL_ENDPOINT };
  process.env.IMAGEKIT_PRIVATE_KEY = "test-private-key";
  process.env.IMAGEKIT_PUBLIC_KEY = "test-public-key";
  process.env.IMAGEKIT_URL_ENDPOINT = "https://ik.imagekit.io/test";
  try {
    const auth = videoUploadAuth(1_000_000_000_000);
    assert.equal(auth.expire, 1_000_000_000 + 1800);
    assert.equal(auth.publicKey, "test-public-key");
    assert.equal(auth.folder, "/noksa/videos");
    assert.equal(auth.signature, createHmac("sha1", "test-private-key").update(auth.token + auth.expire).digest("hex"));
    assert.ok(!JSON.stringify(auth).includes("test-private-key"));
  } finally {
    for (const [name, value] of [["IMAGEKIT_PRIVATE_KEY", saved.key], ["IMAGEKIT_PUBLIC_KEY", saved.pub], ["IMAGEKIT_URL_ENDPOINT", saved.endpoint]]) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});

test("accepts only videos from this account's upload folder", async () => {
  const { isOwnVideoUrl } = await import("../src/lib/imagekit-upload.mjs");
  const saved = { key: process.env.IMAGEKIT_PRIVATE_KEY, endpoint: process.env.IMAGEKIT_URL_ENDPOINT };
  process.env.IMAGEKIT_PRIVATE_KEY = "test-private-key";
  process.env.IMAGEKIT_URL_ENDPOINT = "https://ik.imagekit.io/test";
  try {
    assert.equal(isOwnVideoUrl("https://ik.imagekit.io/test/noksa/videos/clip_abc.mp4"), true);
    assert.equal(isOwnVideoUrl("https://ik.imagekit.io/other/noksa/videos/clip.mp4"), false);
    assert.equal(isOwnVideoUrl("https://ik.imagekit.io/test/noksa/products/clip.mp4"), false);
    assert.equal(isOwnVideoUrl("https://evil.example/test/noksa/videos/clip.mp4"), false);
    assert.equal(isOwnVideoUrl("https://ik.imagekit.io/test/noksa/videos/clip.mp4?tr=x"), false);
    assert.equal(isOwnVideoUrl("javascript:alert(1)"), false);
  } finally {
    for (const [name, value] of [["IMAGEKIT_PRIVATE_KEY", saved.key], ["IMAGEKIT_URL_ENDPOINT", saved.endpoint]]) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});
