import Link from "next/link";
import type { Metadata } from "next";
import { formatPrice } from "@/lib/products";
import { getCustomers } from "@/lib/orders-server";
import { PageHeader, SearchBox } from "../board-ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Customers" };

export default async function BoardCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.trim() ?? "";
  const customers = await getCustomers(q);
  return (
    <>
      <PageHeader title="Customers" subtitle="Customers are added automatically when you create an order." />
      <div className="board-list-toolbar">
        <span />
        <SearchBox placeholder="Search by name, phone or email" defaultValue={q} />
      </div>
      {customers.length === 0 ? (
        <p className="board-empty">{q ? `No customers match “${q}”.` : "No customers yet."}</p>
      ) : (
        <div className="board-table-wrap">
          <table className="board-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Orders</th>
                <th>Amount spent</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/noksaboard/customers/${c.id}`} className="board-cell-link">
                      {c.name}
                    </Link>
                  </td>
                  <td>{c.phone}</td>
                  <td className="board-cell-muted">{c.city ?? "—"}</td>
                  <td>{c.orderCount}</td>
                  <td>{formatPrice(c.amountSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
