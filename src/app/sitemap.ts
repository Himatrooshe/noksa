import type { MetadataRoute } from "next";
import { getStorefrontProductSlugs } from "@/lib/products-server";
import { getPublishedPosts } from "@/lib/blog-server";
import { getSiteUrl } from "@/lib/site-url";
import { storefrontPages } from "@/lib/storefront-pages";

// Catalog edits should appear immediately, including removal of archived products.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [origin, products, posts] = await Promise.all([getSiteUrl(), getStorefrontProductSlugs(), getPublishedPosts()]);
  const paths = [
    "/",
    "/shop",
    ...storefrontPages.map((page) => `/${page.slug}`),
    ...products.map((product) => `/shop/${encodeURIComponent(product.slug)}`),
    "/blog",
    ...posts.map((post) => `/blog/${encodeURIComponent(post.slug)}`),
  ];
  return paths.map((path) => ({ url: new URL(path, origin).href }));
}
