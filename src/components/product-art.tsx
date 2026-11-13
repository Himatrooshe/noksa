import type { Product } from "@/lib/products";
export function ProductArt({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <div
      className={`product-art ${large ? "product-art-large" : ""}`}
      style={{ "--jute": product.color } as React.CSSProperties}
      role="img"
      aria-label={`Illustrative placeholder for ${product.name}`}
    >
      <div className={`woven-item woven-${product.shape}`}>
        <span className="woven-handle handle-back" />
        <span className="woven-body">
          <span className="woven-label">noksa</span>
        </span>
        <span className="woven-handle handle-front" />
      </div>
      <span className="art-caption">Product illustration</span>
    </div>
  );
}
