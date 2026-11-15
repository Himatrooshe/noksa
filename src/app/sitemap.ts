import type { MetadataRoute } from "next";
import { getStorefrontProductSlugs } from "@/lib/products-server";
import { getSiteUrl } from "@/lib/site-url";
import { storefrontPages } from "@/lib/storefront-pages";

// Catalog edits should appear immediately, including removal of archived products.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [origin, products] = await Promise.all([getSiteUrl(), getStorefrontProductSlugs()]);
  const paths = [
    "/",
    "/shop",
    ...storefrontPages.map((page) => `/${page.slug}`),
    ...products.map((product) => `/shop/${encodeURIComponent(product.slug)}`),
  ];
  return paths.map((path) => ({ url: new URL(path, origin).href }));
}
