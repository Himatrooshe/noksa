import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";
import { cache } from "react";
import sanitizeHtml from "sanitize-html";
import { sql } from "@/lib/db";
import {
  variantTitle,
  type Collection,
  type CollectionRef,
  type Product,
  type ProductMedia,
  type ProductOption,
  type ProductShape,
  type ProductStatus,
  type ProductVariant,
} from "@/lib/products";

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  status: ProductStatus;
  description: string;
  dimensions: string;
  color: string;
  shape: ProductShape;
  track_inventory: boolean;
  continue_selling: boolean;
};
type VariantRow = {
  id: string;
  product_id: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  stock: number;
};
type OptionRow = { product_id: string; name: string; option_values: string[] };
type MediaRow = { id: string; product_id: string; url: string; alt: string };
type ProductCollectionRow = CollectionRef & { product_id: string };

function rowsByProduct<T extends { product_id: string }>(rows: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const group = grouped.get(row.product_id);
    if (group) group.push(row);
    else grouped.set(row.product_id, [row]);
  }
  return grouped;
}

export type ProductFilter = {
  /** "storefront" = active only. Omit for every status. */
  status?: ProductStatus | "storefront";
  q?: string;
  id?: string;
  slug?: string;
};

function likePattern(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export async function getProducts(filter: ProductFilter = {}): Promise<Product[]> {
  const q = filter.q?.trim() ? likePattern(filter.q.trim()) : null;
  // The full storefront catalog is read on every storefront page (layout + shop),
  // so it is served from the shared cache. Filtered and dashboard reads stay live.
  if (filter.status === "storefront" && !q && !filter.id && !filter.slug) {
    return getStorefrontCatalog();
  }
  return readProducts(filter.status ?? null, q, filter.id ?? null, filter.slug ?? null);
}

/**
 * Every write that changes what the storefront shows (products, variants,
 * stock, collections) must call this so cached storefront reads refresh at once.
 * The time-based expiry only covers edits made outside the app, e.g. raw SQL.
 */
export function catalogChanged(): void {
  revalidateTag(CATALOG_TAG);
}

const CATALOG_TAG = "catalog";

const getStorefrontCatalog = unstable_cache(
  () => readProducts("storefront", null, null, null),
  ["storefront-catalog"],
  { revalidate: 300, tags: [CATALOG_TAG] },
);

// Primitive arguments let React reuse reads from the layout, page and metadata
// within one render, even when callers construct separate filter objects.
// React's cache is request-scoped, so dashboard edits stay fresh on later requests.
const readProducts = cache(async (
  requestedStatus: ProductFilter["status"] | null,
  q: string | null,
  id: string | null,
  slug: string | null,
): Promise<Product[]> => {
  const status = requestedStatus === "storefront" ? "active" : requestedStatus;
  const rows = (await sql`
    select id, slug, name, status, description, dimensions, color, shape,
           track_inventory, continue_selling
    from products p
    where (${status}::text is null or p.status = ${status})
      and (${id}::uuid is null or p.id = ${id})
      and (${slug}::text is null or p.slug = ${slug})
      and (${q}::text is null
           or p.name ilike ${q}
           or exists (select 1 from product_variants v where v.product_id = p.id and v.sku ilike ${q}))
    order by p.created_at desc
  `) as unknown as ProductRow[];
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const [variants, options, media, collections] = (await Promise.all([
    sql`select id, product_id, option1, option2, option3, price, compare_at_price, sku, stock
        from product_variants where product_id = any(${ids}::uuid[]) order by position, created_at`,
    sql`select product_id, name, option_values from product_options
        where product_id = any(${ids}::uuid[]) order by position`,
    // Keep image bytes out of catalog queries and React's HTML/RSC payload.
    // The editor's single-product lookup still needs the original data URL
    // so saving unchanged media preserves its contents.
    sql`select id, product_id,
          case when ${id === null} and url like 'data:image/%'
            then '/api/product-media/' || id::text else url end as url, alt
        from product_media
        where product_id = any(${ids}::uuid[]) order by position`,
    sql`select pc.product_id, c.id, c.handle, c.title
        from product_collections pc join collections c on c.id = pc.collection_id
        where pc.product_id = any(${ids}::uuid[]) order by c.position, c.title`,
  ])) as unknown as [VariantRow[], OptionRow[], MediaRow[], ProductCollectionRow[]];

  // Build indexes once. Re-filtering every relation array for every product
  // makes the catalog list increasingly sluggish as the shop grows.
  const variantsByProduct = rowsByProduct(variants);
  const optionsByProduct = rowsByProduct(options);
  const mediaByProduct = rowsByProduct(media);
  const collectionsByProduct = rowsByProduct(collections);

  return rows.map((row) => {
    const productVariants: ProductVariant[] = (variantsByProduct.get(row.id) ?? [])
      .map((v) => {
        const opts = [v.option1, v.option2, v.option3].filter((o): o is string => o !== null);
        return {
          id: v.id,
          title: variantTitle(opts),
          options: opts,
          price: Number(v.price),
          compareAtPrice: v.compare_at_price === null ? null : Number(v.compare_at_price),
          sku: v.sku,
          stock: Number(v.stock),
        };
      });
    const cheapest = productVariants.reduce<ProductVariant | null>(
      (min, v) => (min === null || v.price < min.price ? v : min),
      null,
    );
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      status: row.status,
      description: row.description,
      dimensions: row.dimensions,
      color: row.color,
      shape: row.shape,
      trackInventory: row.track_inventory,
      continueSelling: row.continue_selling,
      media: (mediaByProduct.get(row.id) ?? [])
        .map<ProductMedia>((m) => ({ id: m.id, url: m.url, alt: m.alt })),
      options: (optionsByProduct.get(row.id) ?? [])
        .map<ProductOption>((o) => ({ name: o.name, values: o.option_values })),
      variants: productVariants,
      collections: (collectionsByProduct.get(row.id) ?? [])
        .map((c) => ({ id: c.id, handle: c.handle, title: c.title })),
      price: cheapest?.price ?? 0,
      compareAtPrice: cheapest?.compareAtPrice ?? null,
      totalStock: productVariants.reduce((sum, v) => sum + v.stock, 0),
    };
  });
});

/** Storefront lookup: active products only. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getStorefrontCatalog();
  return products.find((product) => product.slug === slug) ?? null;
}

/** Only public URLs belong in the sitemap; no variants or media are needed. */
export async function getStorefrontProductSlugs(): Promise<{ slug: string }[]> {
  return (await sql`
    select slug from products where status = 'active' order by slug
  `) as unknown as { slug: string }[];
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isUuid(id)) return null;
  const [product] = await getProducts({ id });
  return product ?? null;
}

export async function getProductStatusCounts(): Promise<Record<ProductStatus | "all", number>> {
  const rows = (await sql`
    select status, count(*)::int as count from products group by status
  `) as unknown as { status: ProductStatus; count: number }[];
  const counts = { all: 0, active: 0, draft: 0, archived: 0 };
  for (const r of rows) {
    counts[r.status] = r.count;
    counts.all += r.count;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export type VariantInput = {
  /** Existing variant id, or null for a new one. */
  id: string | null;
  options: string[];
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  stock: number;
};

export type ProductInput = {
  name: string;
  slug: string;
  status: ProductStatus;
  descriptionHtml: string;
  dimensions: string;
  color: string;
  shape: ProductShape;
  trackInventory: boolean;
  continueSelling: boolean;
  media: { url: string; alt: string }[];
  options: ProductOption[];
  variants: VariantInput[];
  collectionIds: string[];
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function sanitizeDescription(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "h2", "h3", "h4", "ul", "ol", "li", "a", "blockquote"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  }).trim();
}

/** Postgres error code helper. */
function pgCode(err: unknown): string | undefined {
  return err && typeof err === "object" && "code" in err ? String(err.code) : undefined;
}

function friendlyError(err: unknown, input: { slug?: string; handle?: string }): Error {
  const code = pgCode(err);
  const message = err instanceof Error ? err.message : String(err);
  if (code === "23505") {
    if (message.includes("slug") || message.includes("handle")) {
      return new Error(`The URL handle "${input.slug ?? input.handle}" is already used. Pick another.`);
    }
    if (message.includes("option")) return new Error("Two variants have the same option values.");
    return new Error("That would create a duplicate entry.");
  }
  if (code === "P0001") return new Error(message);
  if (code === "23514") return new Error("A value is out of range (check prices and stock).");
  return new Error(`Couldn't save: ${message}`);
}

/** Creates (no id) or fully replaces (id) a product. Returns the product id. */
export async function saveProduct(input: ProductInput, existingId?: string): Promise<string> {
  const productId = existingId ?? crypto.randomUUID();
  const description = sanitizeDescription(input.descriptionHtml);
  const queries = [];

  if (existingId) {
    queries.push(sql`
      update products set
        slug = ${input.slug}, name = ${input.name}, status = ${input.status},
        description = ${description}, dimensions = ${input.dimensions},
        color = ${input.color}, shape = ${input.shape},
        track_inventory = ${input.trackInventory}, continue_selling = ${input.continueSelling}
      where id = ${productId}
    `);
  } else {
    queries.push(sql`
      insert into products (id, slug, name, status, description, dimensions, color, shape, track_inventory, continue_selling)
      values (${productId}, ${input.slug}, ${input.name}, ${input.status}, ${description},
              ${input.dimensions}, ${input.color}, ${input.shape}, ${input.trackInventory}, ${input.continueSelling})
    `);
  }

  queries.push(sql`delete from product_options where product_id = ${productId}`);
  input.options.forEach((option, position) => {
    queries.push(sql`
      insert into product_options (product_id, name, position, option_values)
      values (${productId}, ${option.name}, ${position}, ${option.values}::text[])
    `);
  });

  // Variants keep their ids (order history and carts reference them):
  // drop the ones removed in the editor, then upsert the rest.
  const variants = input.variants.map((v) => ({ ...v, id: v.id ?? crypto.randomUUID() }));
  const keepIds = variants.map((v) => v.id);
  queries.push(sql`
    delete from product_variants
    where product_id = ${productId} and not (id = any(${keepIds}::uuid[]))
  `);
  // Clear option values first so renaming/swapping values between variants
  // can't trip the (product, option1, option2, option3) unique constraint.
  queries.push(sql`
    update product_variants set option1 = id::text, option2 = null, option3 = null
    where product_id = ${productId}
  `);
  variants.forEach((v, position) => {
    queries.push(sql`
      insert into product_variants
        (id, product_id, option1, option2, option3, price, compare_at_price, sku, stock, position)
      values
        (${v.id}, ${productId}, ${v.options[0] ?? null}, ${v.options[1] ?? null}, ${v.options[2] ?? null},
         ${v.price}, ${v.compareAtPrice}, ${v.sku}, ${v.stock}, ${position})
      on conflict (id) do update set
        option1 = excluded.option1, option2 = excluded.option2, option3 = excluded.option3,
        price = excluded.price, compare_at_price = excluded.compare_at_price,
        sku = excluded.sku, stock = excluded.stock, position = excluded.position
      where product_variants.product_id = excluded.product_id
    `);
  });

  queries.push(sql`delete from product_media where product_id = ${productId}`);
  input.media.forEach((m, position) => {
    queries.push(sql`
      insert into product_media (product_id, url, alt, position)
      values (${productId}, ${m.url}, ${m.alt}, ${position})
    `);
  });

  queries.push(sql`delete from product_collections where product_id = ${productId}`);
  for (const collectionId of input.collectionIds) {
    queries.push(sql`
      insert into product_collections (product_id, collection_id) values (${productId}, ${collectionId})
    `);
  }

  try {
    await sql.transaction(queries);
  } catch (err) {
    throw friendlyError(err, input);
  }
  catalogChanged();
  return productId;
}

export async function setProductsStatus(ids: string[], status: ProductStatus): Promise<void> {
  const valid = ids.filter(isUuid);
  if (valid.length === 0) return;
  await sql`update products set status = ${status} where id = any(${valid}::uuid[])`;
  catalogChanged();
}

export async function deleteProducts(ids: string[]): Promise<void> {
  const valid = ids.filter(isUuid);
  if (valid.length === 0) return;
  await sql`delete from products where id = any(${valid}::uuid[])`;
  catalogChanged();
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

type CollectionRow = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image_url: string | null;
  product_count: number;
};

function mapCollection(r: CollectionRow): Collection {
  return {
    id: r.id,
    handle: r.handle,
    title: r.title,
    description: r.description,
    imageUrl: r.image_url,
    productCount: Number(r.product_count),
  };
}

/** `storefront` counts only active products. */
/** Lightweight read for the home page's category cards: one photo per category. */
async function readCategoryCovers(
  productSlugs: string[],
  collectionHandles: string[],
): Promise<Record<string, string>> {
  const [products, collections] = (await Promise.all([
    sql`select p.slug as key,
          (select case when m.url like 'data:image/%'
                  then '/api/product-media/' || m.id::text else m.url end
           from product_media m where m.product_id = p.id order by m.position limit 1) as url
        from products p
        where p.status = 'active' and p.slug = any(${productSlugs}::text[])`,
    sql`select handle as key, image_url as url from collections
        where handle = any(${collectionHandles}::text[])`,
  ])) as unknown as [{ key: string; url: string | null }[], { key: string; url: string | null }[]];
  const covers: Record<string, string> = {};
  for (const row of [...products, ...collections]) if (row.url) covers[row.key] = row.url;
  return covers;
}

// Cached like the storefront catalog; catalogChanged() clears it.
export const getCategoryCovers = unstable_cache(readCategoryCovers, ["category-covers"], {
  revalidate: 300,
  tags: [CATALOG_TAG],
});

export async function getCollections(opts: { storefront?: boolean } = {}): Promise<Collection[]> {
  return opts.storefront ? getStorefrontCollections() : readCollections(false);
}

const getStorefrontCollections = unstable_cache(() => readCollections(true), ["storefront-collections"], {
  revalidate: 300,
  tags: [CATALOG_TAG],
});

async function readCollections(activeOnly: boolean): Promise<Collection[]> {
  const rows = (await sql`
    select c.id, c.handle, c.title, c.description, c.image_url,
           count(p.id)::int as product_count
    from collections c
    left join product_collections pc on pc.collection_id = c.id
    left join products p on p.id = pc.product_id and (not ${activeOnly} or p.status = 'active')
    group by c.id
    order by c.position, c.title
  `) as unknown as CollectionRow[];
  return rows.map(mapCollection);
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  if (!isUuid(id)) return null;
  const rows = (await sql`
    select c.id, c.handle, c.title, c.description, c.image_url,
           (select count(*)::int from product_collections pc where pc.collection_id = c.id) as product_count
    from collections c where c.id = ${id}
  `) as unknown as CollectionRow[];
  return rows[0] ? mapCollection(rows[0]) : null;
}

export async function getCollectionProducts(collectionId: string): Promise<{ id: string; name: string; status: ProductStatus }[]> {
  return (await sql`
    select p.id, p.name, p.status
    from product_collections pc join products p on p.id = pc.product_id
    where pc.collection_id = ${collectionId}
    order by p.name
  `) as unknown as { id: string; name: string; status: ProductStatus }[];
}

export type CollectionInput = {
  title: string;
  handle: string;
  description: string;
  imageUrl: string | null;
};

export async function saveCollection(input: CollectionInput, existingId?: string): Promise<string> {
  const id = existingId ?? crypto.randomUUID();
  try {
    if (existingId) {
      await sql`
        update collections set title = ${input.title}, handle = ${input.handle},
          description = ${input.description}, image_url = ${input.imageUrl}
        where id = ${id}
      `;
    } else {
      await sql`
        insert into collections (id, title, handle, description, image_url, position)
        values (${id}, ${input.title}, ${input.handle}, ${input.description}, ${input.imageUrl},
                (select coalesce(max(position), 0) + 1 from collections))
      `;
    }
  } catch (err) {
    throw friendlyError(err, input);
  }
  catalogChanged();
  return id;
}

export async function deleteCollection(id: string): Promise<void> {
  if (!isUuid(id)) return;
  await sql`delete from collections where id = ${id}`;
  catalogChanged();
}
