// Client-safe types + helpers shared by server and client components.
// Database access lives in src/lib/products-server.ts and
// src/lib/orders-server.ts, both `import "server-only"`.

export const ALL_PRODUCTS = "All products" as const;
export const DEFAULT_VARIANT_TITLE = "Default Title";

export type ProductStatus = "active" | "draft" | "archived";
export type ProductShape = "tote" | "basket" | "pouch" | "round";

export type ProductMedia = { id: string; url: string; alt: string };
export type ProductOption = { name: string; values: string[] };
export type ProductVariant = {
  id: string;
  title: string;
  options: string[];
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  stock: number;
};
export type CollectionRef = { id: string; handle: string; title: string };
export type Collection = CollectionRef & {
  description: string;
  imageUrl: string | null;
  productCount: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  status: ProductStatus;
  /** Sanitized HTML. */
  description: string;
  dimensions: string;
  color: string;
  shape: ProductShape;
  trackInventory: boolean;
  continueSelling: boolean;
  media: ProductMedia[];
  options: ProductOption[];
  variants: ProductVariant[];
  collections: CollectionRef[];
  /** Lowest variant price, and that variant's compare-at price. */
  price: number;
  compareAtPrice: number | null;
  totalStock: number;
};

// Monetary values are stored as whole US dollars throughout the catalog
// and orders. Do not divide by 100: the database does not store cents.
const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
export const formatPrice = (price: number) => usdFormatter.format(price);

export function variantTitle(options: (string | null | undefined)[]): string {
  const parts = options.filter((o): o is string => Boolean(o));
  return parts.length ? parts.join(" / ") : DEFAULT_VARIANT_TITLE;
}

export function isVariantAvailable(
  product: Pick<Product, "trackInventory" | "continueSelling">,
  variant: Pick<ProductVariant, "stock">,
): boolean {
  return !product.trackInventory || product.continueSelling || variant.stock > 0;
}

export function isProductAvailable(product: Product): boolean {
  return product.variants.some((v) => isVariantAvailable(product, v));
}

export function hasRealVariants(product: Pick<Product, "options">): boolean {
  return product.options.length > 0;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
