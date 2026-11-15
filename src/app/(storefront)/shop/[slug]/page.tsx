import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getProducts } from "@/lib/products-server";
import { ProductGallery, ProductPurchase } from "@/components/product-purchase";
import { ProductGrid } from "@/components/product-grid";
import { getPageMetadata } from "@/lib/site-url";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found", robots: { index: false } };
  return getPageMetadata(`/shop/${encodeURIComponent(product.slug)}`, product.name);
}
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const products = await getProducts({ status: "storefront" });
  const collectionIds = new Set(product.collections.map((collection) => collection.id));
  const sharesCollection = (candidate: (typeof products)[number]) =>
    candidate.collections.some((collection) => collectionIds.has(collection.id));
  const recommendedProducts = products
    .filter((candidate) => candidate.id !== product.id)
    .sort((a, b) => Number(sharesCollection(b)) - Number(sharesCollection(a)))
    .slice(0, 4);
  return (
    <main id="main-content" className="container product-page">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop">Shop</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>
      <div className="product-detail">
        <ProductGallery product={product} />
        <div className="product-detail-copy">
          <p className="eyebrow">{product.collections[0]?.title}</p>
          <h1>{product.name}</h1>
          <ProductPurchase product={product} />
          <div
            className="product-description"
            // Sanitized on save (sanitizeDescription in products-server.ts).
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
          <div className="product-specs">
            <details open>
              <summary>Materials & dimensions</summary>
              <p>
                Natural jute.{product.dimensions && ` Approx. ${product.dimensions}.`} Handmade pieces
                may vary slightly.
              </p>
            </details>
            <details>
              <summary>Care guide</summary>
              <p>
                Spot clean gently with a damp cloth. Air dry fully and store in a dry place. Avoid
                machine washing or soaking.
              </p>
            </details>
            <details>
              <summary>Shipping & returns</summary>
              <p>
                Shipping destinations, delivery estimates, and return terms will be confirmed before
                the store opens for orders.
                {" "}<Link href="/shipping-policy">Shipping policy</Link> and{" "}
                <Link href="/refund-policy">returns & refunds</Link>.
              </p>
            </details>
          </div>
        </div>
      </div>
      {recommendedProducts.length > 0 && (
        <section className="product-recommendations" aria-labelledby="recommended-products-title">
          <div className="section-heading">
            <h2 id="recommended-products-title">Recommended products</h2>
            <Link href="/shop" className="inline-link">View all products</Link>
          </div>
          <ProductGrid products={recommendedProducts} />
        </section>
      )}
    </main>
  );
}
