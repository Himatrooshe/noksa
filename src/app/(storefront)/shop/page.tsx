import { ProductGrid } from "@/components/product-grid";
import { getCollections, getProducts } from "@/lib/products-server";
import { getPageMetadata } from "@/lib/site-url";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return getPageMetadata("/shop", "Shop the collection");
}
export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [products, collections] = await Promise.all([
    getProducts({ status: "storefront" }),
    getCollections({ storefront: true }),
  ]);
  const categoryNames = collections.filter((c) => c.productCount > 0).map((c) => c.title);
  const activeCategory = category && categoryNames.includes(category) ? category : null;
  return (
    <main
      id="main-content"
      className={`container shop-page section-space ${activeCategory ? "shop-page-compact" : ""}`}
    >
      {activeCategory ? (
        <div className="shop-heading shop-heading-compact">
          <p className="eyebrow">The Noksa collection</p>
          <h1>{activeCategory}</h1>
        </div>
      ) : (
        <div className="shop-heading">
          <p className="eyebrow">The Noksa collection</p>
          <h1>
            A little more natural.
            <br />A little more you.
          </h1>
          <p>Everyday bags, warm details for home, and small things with purpose.</p>
        </div>
      )}
      <ProductGrid products={products} categoryNames={categoryNames} filters initialCategory={category} />
    </main>
  );
}
