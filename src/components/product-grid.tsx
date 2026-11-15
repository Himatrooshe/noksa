"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ALL_PRODUCTS,
  formatPrice,
  hasRealVariants,
  isProductAvailable,
  type Product,
} from "@/lib/products";
import { ProductArt } from "./product-art";
import { AddToBag } from "./cart-provider";
import { imageUrl } from "@/lib/image-url";

export function ProductImage({ product, large = false }: { product: Product; large?: boolean }) {
  const image = product.media[0];
  if (!image) return <ProductArt product={product} large={large} />;
  return (
    // Plain <img>: product images can come from any host (pasted URLs), so
    // next/image's remotePatterns allowlist would reject most of them.
    <img
      className={`product-photo ${large ? "product-photo-large" : ""}`}
      src={imageUrl(image.url, large ? 1200 : 640)}
      srcSet={[320, 640, 960, 1200].map((width) => `${imageUrl(image.url, width)} ${width}w`).join(", ")}
      sizes={large ? "(max-width: 760px) 100vw, 50vw" : "(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"}
      alt={image.alt || product.name}
      loading={large ? "eager" : "lazy"}
    />
  );
}

export function ProductPrice({ price, compareAtPrice }: { price: number; compareAtPrice: number | null }) {
  if (compareAtPrice && compareAtPrice > price) {
    return (
      <span className="price-sale">
        <span>{formatPrice(price)}</span>{" "}
        <s aria-label={`Was ${formatPrice(compareAtPrice)}`}>{formatPrice(compareAtPrice)}</s>
      </span>
    );
  }
  return <span>{formatPrice(price)}</span>;
}

export function ProductGrid({
  products,
  categoryNames,
  filters = false,
}: {
  products: Product[];
  categoryNames?: string[];
  filters?: boolean;
}) {
  const [category, setCategory] = useState<string>(ALL_PRODUCTS);
  const shown = products.filter(
    (product) =>
      category === ALL_PRODUCTS || product.collections.some((c) => c.title === category),
  );
  const filterOptions = [ALL_PRODUCTS, ...(categoryNames ?? [])];
  return (
    <>
      {filters && (
        <div className="category-filters" role="group" aria-label="Filter products by collection">
          {filterOptions.map((value) => (
            <button
              key={value}
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
            >
              {value}
            </button>
          ))}
        </div>
      )}
      <div className="product-grid">
        {shown.map((product) => {
          const available = isProductAvailable(product);
          const multi = hasRealVariants(product);
          return (
            <article className="product-card" key={product.id}>
              <Link href={`/shop/${product.slug}`} className="product-image-link">
                <ProductImage product={product} />
              </Link>
              <div className="product-meta">
                <span>{product.collections[0]?.title ?? ""}</span>
                <span>
                  {multi && "From "}
                  <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} />
                </span>
              </div>
              <h3>
                <Link href={`/shop/${product.slug}`}>{product.name}</Link>
              </h3>
              {multi ? (
                <Link href={`/shop/${product.slug}`} className="button">
                  {available ? "Choose options" : "Sold out"}
                </Link>
              ) : (
                <AddToBag id={product.variants[0]?.id ?? ""} disabled={!available} />
              )}
            </article>
          );
        })}
      </div>
      {shown.length === 0 && <p className="sample-note">No products here yet.</p>}
      <span className="sr-only" role="status">
        {shown.length} products displayed
      </span>
    </>
  );
}
