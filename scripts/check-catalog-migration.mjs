// Exercise real PostgreSQL in isolated schemas; every case rolls back.
// No existing products, schema migration records, customers, or orders change.
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { Pool } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) process.loadEnvFile(".env.local");
if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
const files = await Promise.all(["001_init.sql", "002_catalog_orders.sql", "003_initial_published_catalog.sql"].map(file => readFile(`db/migrations/${file}`, "utf8")));
try {
  for (const partial of [false, true]) {
    await client.query("begin");
    try {
      const schema = `noksa_catalog_check_${randomUUID().replaceAll("-", "")}`;
      await client.query(`create schema "${schema}"`);
      await client.query(`set local search_path to "${schema}", public`);
      await client.query(files[0]);
      await client.query(files[1]);
      let existingProduct;
      if (partial) {
        existingProduct = randomUUID();
        await client.query("insert into products (id,slug,name,status) values ($1,'fanny-bag-desert-sand','Edited product','draft')", [existingProduct]);
        await client.query("insert into product_variants (product_id,price,stock) values ($1,45,3)", [existingProduct]);
        await client.query("insert into collections (handle,title) values ('fanny-bags','Existing collection')");
      }
      await client.query(files[2]);
      const counts = (await client.query("select (select count(*) from products)::int as products,(select count(*) from collections)::int as collections,(select count(*) from product_variants)::int as variants,(select count(*) from product_media)::int as media,(select count(*) from product_collections)::int as links")).rows[0];
      assert.deepEqual(counts, { products: 8, collections: 4, variants: 8, media: 57, links: 8 });
      const badImages = await client.query("select id from product_media where url not like 'https://ik.imagekit.io/%'");
      assert.equal(badImages.rowCount, 0);
      const visible = (await client.query("select count(*)::int as count from products where status='active'")).rows[0].count;
      assert.equal(visible, partial ? 7 : 8);
      if (partial) {
        const product = (await client.query("select p.id,p.name,p.status,v.price,v.stock from products p join product_variants v on v.product_id=p.id where p.slug='fanny-bag-desert-sand'")).rows[0];
        assert.deepEqual(product, { id: existingProduct, name: "Edited product", status: "draft", price: 45, stock: 3 });
        assert.equal((await client.query("select title from collections where handle='fanny-bags'")).rows[0].title, "Existing collection");
      }
      // Rerunning after sales/admin edits must never replenish inventory or
      // reset prices, archive state, descriptions, covers, or gallery edits.
      await client.query("update product_variants set price=55,stock=2");
      await client.query("update products set status='archived',description='Updated by owner'");
      await client.query("update product_media set url='https://example.com/edited.webp'");
      await client.query("update collections set image_url='https://example.com/cover.webp'");
      await client.query(files[2]);
      assert.equal((await client.query("select count(*)::int as count from product_variants where price=55 and stock=2")).rows[0].count, 8);
      assert.equal((await client.query("select count(*)::int as count from products where status='archived' and description='Updated by owner'")).rows[0].count, 8);
      assert.equal((await client.query("select count(*)::int as count from product_media where url='https://example.com/edited.webp'")).rows[0].count, 57);
      assert.equal((await client.query("select count(*)::int as count from product_media")).rows[0].count, 57);
      assert.equal((await client.query("select count(*)::int as count from collections where image_url='https://example.com/cover.webp'")).rows[0].count, 4);
      console.log(`PASS: ${partial ? "existing records with different IDs" : "fresh database"}; catalog counts, ImageKit URLs, and safe replay`);
    } finally {
      await client.query("rollback");
    }
  }
} finally {
  client.release();
  await pool.end();
}
