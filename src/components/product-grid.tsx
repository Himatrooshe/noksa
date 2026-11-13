"use client";
import { useState } from "react";
import Link from "next/link";
import { categories, products, formatPrice, type Category } from "@/lib/products";
import { ProductArt } from "./product-art";
import { AddToBag } from "./cart-provider";
export function ProductGrid({ filters = false }: { filters?: boolean }) {
  const [category, setCategory] = useState<Category>("All products");
  const shown = products.filter(
    (product) => category === "All products" || product.category === category,
  );
  return (
    <>
      {filters && (
        <div className="category-filters" role="group" aria-label="Filter products by category">
          {categories.map((value) => (
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
      <p className="sample-note">
        A first look at the collection. Illustrations and prices are placeholders.
      </p>
      <div className="product-grid">
        {shown.map((product) => (
          <article className="product-card" key={product.id}>
            <Link href={`/shop/${product.id}`} className="product-image-link">
              <ProductArt product={product} />
            </Link>
            <div className="product-meta">
              <span>{product.category}</span>
              <span>{formatPrice(product.price)}</span>
            </div>
            <h3>
              <Link href={`/shop/${product.id}`}>{product.name}</Link>
            </h3>
            <AddToBag id={product.id} />
          </article>
        ))}
      </div>
      <span className="sr-only" role="status">
        {shown.length} products displayed
      </span>
    </>
  );
}
