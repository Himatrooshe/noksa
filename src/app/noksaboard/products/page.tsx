import Link from "next/link";
import type { Metadata } from "next";
import type { ProductStatus } from "@/lib/products";
import { getProducts, getProductStatusCounts } from "@/lib/products-server";
import { PageHeader, SearchBox, Tabs } from "../board-ui";
import { ProductTable } from "./product-table";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products" };

const TABS: { key: ProductStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "draft", label: "Draft" },
  { key: "archived", label: "Archived" },
];

export default async function BoardProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const tab = TABS.find((t) => t.key === params.status)?.key ?? "all";
  const q = params.q?.trim() ?? "";
  const [products, counts] = await Promise.all([
    getProducts({ status: tab === "all" ? undefined : tab, q }),
    getProductStatusCounts(),
  ]);

  return (
    <>
      <PageHeader
        title="Products"
        actions={
          <Link href="/noksaboard/products/new" className="board-button board-button-primary">
            Add product
          </Link>
        }
      />
      <div className="board-list-toolbar">
        <Tabs
          active={tab}
          tabs={TABS.map((t) => ({
            key: t.key,
            label: t.label,
            count: counts[t.key],
            href: t.key === "all" ? "/noksaboard/products" : `/noksaboard/products?status=${t.key}`,
          }))}
        />
        <SearchBox
          placeholder="Search by title or SKU"
          defaultValue={q}
          hidden={tab === "all" ? undefined : { status: tab }}
        />
      </div>
      {products.length === 0 ? (
        <div className="board-empty">
          {q ? (
            <>No products match “{q}”.</>
          ) : counts.all === 0 ? (
            <>
              <p>Add your first product to start selling.</p>
              <Link href="/noksaboard/products/new" className="board-button board-button-primary">
                Add product
              </Link>
            </>
          ) : (
            <>No {tab} products.</>
          )}
        </div>
      ) : (
        <ProductTable products={products} />
      )}
    </>
  );
}
