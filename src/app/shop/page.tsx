import type { Metadata } from "next";
import { ProductGrid } from "@/components/product-grid";
export const metadata: Metadata = { title: "Shop the collection" };
export default function Shop() {
  return (
    <main id="main-content" className="container shop-page section-space">
      <div className="shop-heading">
        <p className="eyebrow">The Noksa collection</p>
        <h1>
          A little more natural.
          <br />A little more you.
        </h1>
        <p>Everyday bags, warm details for home, and small things with purpose.</p>
      </div>
      <ProductGrid filters />
    </main>
  );
}
