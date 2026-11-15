import Link from "next/link";
import type { Metadata } from "next";
import { getCollections } from "@/lib/products-server";
import { PageHeader } from "../board-ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Collections" };

export default async function BoardCollectionsPage() {
  const collections = await getCollections();
  return (
    <>
      <PageHeader
        title="Collections"
        subtitle="Group products for the shop's filters. Add products to a collection from the product page."
        actions={
          <Link href="/noksaboard/collections/new" className="board-button board-button-primary">
            Create collection
          </Link>
        }
      />
      {collections.length === 0 ? (
        <p className="board-empty">No collections yet.</p>
      ) : (
        <div className="board-table-wrap">
          <table className="board-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Products</th>
                <th>URL handle</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/noksaboard/collections/${c.id}`} className="board-cell-link">
                      {c.title}
                    </Link>
                  </td>
                  <td>{c.productCount}</td>
                  <td className="board-cell-muted">{c.handle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
