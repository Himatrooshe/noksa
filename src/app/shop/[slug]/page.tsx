import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products, formatPrice } from "@/lib/products";
import { ProductArt } from "@/components/product-art";
import { AddToBag } from "@/components/cart-provider";
export function generateStaticParams() {
  return products.map((product) => ({ slug: product.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.id === slug);
  return { title: product?.name || "Product not found" };
}
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((p) => p.id === slug);
  if (!product) notFound();
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
        <ProductArt product={product} large />
        <div className="product-detail-copy">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">{formatPrice(product.price)}</p>
          <p>{product.description}</p>
          <p className="sample-note">
            Sample product. Illustration, specifications, and price are placeholders until launch.
          </p>
          <AddToBag id={product.id} />
          <div className="product-specs">
            <details open>
              <summary>Materials & dimensions</summary>
              <p>Natural jute. Approx. {product.dimensions}. Handmade pieces may vary slightly.</p>
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
              </p>
            </details>
          </div>
        </div>
      </div>
    </main>
  );
}
