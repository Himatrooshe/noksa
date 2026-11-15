import Link from "next/link";
import type { Metadata } from "next";
import { formatPrice } from "@/lib/products";
import { formatDate, formatOrderNumber, paymentMethodLabel } from "@/lib/orders";
import { getOrders, getOrderTabCounts, type OrderTab } from "@/lib/orders-server";
import { FulfillmentBadge, OrderStatusBadge, PageHeader, PaymentBadge, SearchBox, Tabs } from "../board-ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orders" };

const TABS: { key: OrderTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unfulfilled", label: "Unfulfilled" },
  { key: "unpaid", label: "Unpaid" },
  { key: "open", label: "Open" },
  { key: "archived", label: "Archived" },
];

export default async function BoardOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const params = await searchParams;
  const tab = TABS.find((t) => t.key === params.tab)?.key ?? "all";
  const q = params.q?.trim() ?? "";
  const [orders, counts] = await Promise.all([getOrders({ tab, q }), getOrderTabCounts()]);

  return (
    <>
      <PageHeader
        title="Orders"
        actions={
          <Link href="/noksaboard/orders/new" className="board-button board-button-primary">
            Create order
          </Link>
        }
      />
      <div className="board-list-toolbar">
        <Tabs
          active={tab}
          tabs={TABS.map((t) => ({
            key: t.key,
            label: t.label,
            count: t.key === "unfulfilled" ? counts.unfulfilled : t.key === "unpaid" ? counts.unpaid : undefined,
            href: t.key === "all" ? "/noksaboard/orders" : `/noksaboard/orders?tab=${t.key}`,
          }))}
        />
        <SearchBox
          placeholder="Search by order #, name or phone"
          defaultValue={q}
          hidden={tab === "all" ? undefined : { tab }}
        />
      </div>
      {orders.length === 0 ? (
        <div className="board-empty">
          {q ? (
            <>No orders match “{q}”.</>
          ) : tab === "all" ? (
            <>
              <p>No orders yet. Record orders you take by phone, Facebook or WhatsApp here.</p>
              <Link href="/noksaboard/orders/new" className="board-button board-button-primary">
                Create order
              </Link>
            </>
          ) : (
            <>Nothing here.</>
          )}
        </div>
      ) : (
        <div className="board-table-wrap">
          <table className="board-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/noksaboard/orders/${o.id}`} className="board-cell-link">
                      {formatOrderNumber(o.orderNumber)}
                    </Link>{" "}
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="board-cell-muted">{formatDate(o.createdAt)}</td>
                  <td>
                    {o.customerName}
                    {o.customerPhone && <div className="board-cell-muted">{o.customerPhone}</div>}
                  </td>
                  <td>
                    {formatPrice(o.total)}
                    <div className="board-cell-muted">{paymentMethodLabel(o.paymentMethod)}</div>
                  </td>
                  <td>
                    <PaymentBadge status={o.paymentStatus} />
                  </td>
                  <td>
                    <FulfillmentBadge status={o.fulfillmentStatus} />
                  </td>
                  <td>
                    {o.itemCount} item{o.itemCount === 1 ? "" : "s"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
