const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

// Compile blog-server.ts and stub its server dependencies; no database is used.
function loadBlogServer() {
  const file = "src/lib/blog-server.ts";
  const source = readFileSync(path.join(__dirname, "..", file), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  const exports = {};
  const deps = {
    "server-only": {},
    "next/cache": { unstable_cache: (fn) => fn, revalidateTag: () => {} },
    "sanitize-html": require("sanitize-html"),
    "@/lib/db": { sql: async () => [] },
    "@/lib/products-server": { isUuid: () => true },
    "@/lib/blog": { readingMinutes: () => 1 },
  };
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      if (Object.hasOwn(deps, name)) return deps[name];
      throw new Error(`Unexpected dependency: ${name}`);
    },
  }, { filename: file });
  return exports;
}

const { sanitizeBlogHtml } = loadBlogServer();

test("keeps the formatting the blog editor produces", () => {
  const html = '<h2>Title</h2><p><strong>Bold</strong> and <em>soft</em></p><blockquote>Quote</blockquote><hr><ul><li>One</li></ul>';
  assert.equal(sanitizeBlogHtml(html), html.replace("<hr>", "<hr />"));
});

test("keeps https images with alt text but drops other image sources and attributes", () => {
  assert.equal(
    sanitizeBlogHtml('<p><img src="https://ik.imagekit.io/x/a.webp" alt="Jute" onerror="alert(1)" style="x"></p>'),
    '<p><img src="https://ik.imagekit.io/x/a.webp" alt="Jute" /></p>',
  );
  assert.equal(sanitizeBlogHtml('<img src="http://example.com/a.png">'), "<img />");
  assert.equal(sanitizeBlogHtml('<img src="data:image/png;base64,AAAA">'), "<img />");
  assert.equal(sanitizeBlogHtml('<img src="javascript:alert(1)">'), "<img />");
});

test("removes scripts, event handlers and unsafe links", () => {
  assert.equal(sanitizeBlogHtml('<p onclick="x()">Hi<script>alert(1)</script></p>'), "<p>Hi</p>");
  assert.equal(sanitizeBlogHtml('<a href="javascript:alert(1)">x</a>'), '<a rel="noopener noreferrer">x</a>');
  assert.equal(sanitizeBlogHtml('<iframe src="https://evil.example"></iframe><p>ok</p>'), "<p>ok</p>");
});

test("marks links noopener", () => {
  assert.equal(
    sanitizeBlogHtml('<a href="https://medium.com/x" target="_blank">read</a>'),
    '<a href="https://medium.com/x" target="_blank" rel="noopener noreferrer">read</a>',
  );
});
