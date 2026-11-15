"use client";
import { useState } from "react";
import { isVariantAvailable, type Product, type ProductVariant } from "@/lib/products";
import { AddToBag } from "./cart-provider";
import { ProductArt } from "./product-art";
import { ProductPrice } from "./product-grid";
import { imageUrl } from "@/lib/image-url";

/** Main photo + thumbnails. Falls back to the illustration with no photos. */
export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  if (product.media.length === 0) return <ProductArt product={product} large />;
  const current = product.media[Math.min(active, product.media.length - 1)];
  return (
    <div className="product-gallery">
      <img
        className="product-photo product-photo-large"
        src={imageUrl(current.url, 1200)}
        srcSet={[640, 960, 1200].map((width) => `${imageUrl(current.url, width)} ${width}w`).join(", ")}
        sizes="(max-width: 760px) 100vw, 50vw"
        alt={current.alt || product.name}
      />
      {product.media.length > 1 && (
        <div className="product-thumbs" role="group" aria-label="Product photos">
          {product.media.map((m, i) => (
            <button
              key={m.id}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              <img src={imageUrl(m.url, 160)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function findVariant(product: Product, selected: string[]): ProductVariant | undefined {
  return product.variants.find((v) => v.options.every((value, i) => value === selected[i]));
}

/** Price, option pickers, stock message, and Add to bag for one product. */
export function ProductPurchase({ product }: { product: Product }) {
  const firstAvailable =
    product.variants.find((v) => isVariantAvailable(product, v)) ?? product.variants[0];
  const [selected, setSelected] = useState<string[]>(firstAvailable?.options ?? []);
  const variant = findVariant(product, selected);
  const available = variant ? isVariantAvailable(product, variant) : false;
  const lowStock =
    variant && product.trackInventory && !product.continueSelling && variant.stock > 0 && variant.stock <= 3;

  return (
    <div className="product-purchase">
      <p className="detail-price">
        {variant ? (
          <ProductPrice price={variant.price} compareAtPrice={variant.compareAtPrice} />
        ) : (
          "Unavailable"
        )}
      </p>
      {product.options.map((option, optionIndex) => (
        <fieldset className="option-picker" key={option.name}>
          <legend>
            {option.name}: <strong>{selected[optionIndex]}</strong>
          </legend>
          <div className="option-values">
            {option.values.map((value) => {
              const candidate = [...selected];
              candidate[optionIndex] = value;
              const match = findVariant(product, candidate);
              const soldOut = !match || !isVariantAvailable(product, match);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected[optionIndex] === value}
                  className={soldOut ? "is-sold-out" : undefined}
                  onClick={() => setSelected(candidate)}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      {lowStock && <p className="stock-note">Only {variant.stock} left</p>}
      <AddToBag id={variant?.id ?? ""} disabled={!variant || !available} />
    </div>
  );
}
