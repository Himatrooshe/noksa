const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

// Compile the route with the project's TypeScript compiler and supply its
// server dependencies explicitly. These tests never connect to a database.
function loadSource(file, dependencies) {
  const source = readFileSync(path.join(__dirname, "..", file), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, Buffer, Response,
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected dependency: ${name}`);
    },
  }, { filename: file });
  return exports;
}

function setup(rows, authorized = false) {
  let queries = 0;
  const sql = async () => {
    queries++;
    if (rows instanceof Error) throw rows;
    return rows;
  };
  const products = loadSource("src/lib/products.ts", {});
  const server = loadSource("src/lib/products-server.ts", {
    "server-only": {}, react: require("react"), "sanitize-html": require("sanitize-html"),
    "next/cache": { unstable_cache: (fn) => fn, revalidateTag: () => {} },
    "@/lib/db": { sql }, "@/lib/products": products,
  });
  const { GET } = loadSource("src/app/api/product-media/[id]/route.ts", {
    "next/headers": { cookies: async () => ({ get: () => authorized ? { value: "test-session" } : undefined }) },
    "@/lib/admin-session": {
      ADMIN_SESSION_COOKIE: "session",
      isValidSessionToken: async (token) => authorized && token === "test-session",
    },
    "@/lib/db": { sql }, "@/lib/products-server": server,
  });
  return {
    get: (id = "11111111-1111-4111-8111-111111111111") => GET(undefined, { params: Promise.resolve({ id }) }),
    queries: () => queries,
  };
}

const png = "data:image/png;base64,iVBORw0KGgo=";

test("returns binary image data with its raster content type", async () => {
  const app = setup([{ url: png, status: "active" }]);
  const response = await app.get();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/png");
  assert.equal(response.headers.get("content-length"), "8");
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), Buffer.from("iVBORw0KGgo=", "base64"));
});

test("rejects invalid IDs before querying and returns 404 for missing media", async () => {
  const app = setup([]);
  assert.equal((await app.get("not-a-uuid")).status, 404);
  assert.equal(app.queries(), 0);
  assert.equal((await app.get()).status, 404);
});

test("draft and archived images require a valid dashboard session", async () => {
  for (const status of ["draft", "archived"]) {
    assert.equal((await setup([{ url: png, status }]).get()).status, 404);
    assert.equal((await setup([{ url: png, status }], true).get()).status, 200);
  }
});

test("does not serve remote links, SVG, HTML or malformed data as images", async () => {
  for (const url of [
    "https://example.com/photo.png", "data:image/svg+xml;base64,PHN2Zz4=",
    "data:text/html;base64,PGgxPg==", "data:image/png;base64,%%%", "data:image/png;base64,",
  ]) {
    assert.equal((await setup([{ url, status: "active" }]).get()).status, 404);
  }
});

test("propagates database failures instead of returning a misleading 404", async () => {
  await assert.rejects(setup(new Error("Database unavailable")).get(), /Database unavailable/);
});
