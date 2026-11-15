import Link from "next/link";
import type { Metadata } from "next";
import { formatPrice } from "@/lib/products";
import { formatDate, formatOrderNumber } from "@/lib/orders";
import { getHomeData, type HomeRange } from "@/lib/orders-server";
import { Card, FulfillmentBadge, PageHeader, PaymentBadge, Tabs } from "./board-ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Home" };

const RANGES: { key: HomeRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "all", label: "All time" },
];

export default async function BoardHomePage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const params = await searchParams;
  const range = RANGES.find((r) => r.key === params.range)?.key ?? "30d";
  const data = await getHomeData(range);

  const todos = [
    { count: data.todo.toFulfill, label: "to ship", noun: "order", href: "/noksaboard/orders?tab=unfulfilled" },
    { count: data.todo.unpaid, label: "awaiting payment", noun: "order", href: "/noksaboard/orders?tab=unpaid" },
    { count: data.todo.inTransit, label: "out for delivery", noun: "order", href: "/noksaboard/orders?tab=open" },
    { count: data.todo.lowStock, label: "low on stock (3 or fewer)", noun: "item", href: "/noksaboard/products?status=active" },
  ].filter((t) => t.count > 0);

  return (
    <>
      <PageHeader title="Home" />
      <Tabs
        active={range}
        tabs={RANGES.map((r) => ({
          key: r.key,
          label: r.label,
          href: r.key === "30d" ? "/noksaboard" : `/noksaboard?range=${r.key}`,
        }))}
      />
      <div className="board-stat-grid">
        <div className="board-stat-card">
          <span className="board-stat-label">Total sales</span>
          <span className="board-stat-value">{formatPrice(data.sales)}</span>
        </div>
        <div className="board-stat-card">
          <span className="board-stat-label">Orders</span>
          <span className="board-stat-value">{data.orders}</span>
        </div>
        <div className="board-stat-card">
          <span className="board-stat-label">Average order value</span>
          <span className="board-stat-value">{formatPrice(data.averageOrderValue)}</span>
        </div>
      </div>

      <div className="board-editor-grid">
        <div className="board-editor-main">
          <Card title="To do">
            {todos.length === 0 ? (
              <p className="board-hint">You&apos;re all caught up.</p>
            ) : (
              <ul className="board-todo">
                {todos.map((t) => (
                  <li key={t.label}>
                    <Link href={t.href}>
                      <strong>
                        {t.count} {t.noun}
                        {t.count === 1 ? "" : "s"}
                      </strong>{" "}
                      {t.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Recent orders" flush>
            {data.recentOrders.length === 0 ? (
              <p className="board-hint board-card-pad">
                No orders yet. <Link href="/noksaboard/orders/new">Create one</Link> for a phone or Facebook order.
              </p>
            ) : (
              <table className="board-table">
                <tbody>
                  {data.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Link href={`/noksaboard/orders/${o.id}`} className="board-cell-link">
                          {formatOrderNumber(o.orderNumber)}
                        </Link>
                      </td>
                      <td>{o.customerName}</td>
                      <td className="board-cell-muted">{formatDate(o.createdAt)}</td>
                      <td>
                        <PaymentBadge status={o.paymentStatus} />
                      </td>
                      <td>
                        <FulfillmentBadge status={o.fulfillmentStatus} />
                      </td>
                      <td className="board-cell-right">{formatPrice(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
        <aside className="board-editor-side">
          <Card title="Top products">
            {data.topProducts.length === 0 ? (
              <p className="board-hint">No sales in this period.</p>
            ) : (
              <ol className="board-plain-list">
                {data.topProducts.map((p) => (
                  <li key={p.name}>
                    <span>{p.name}</span>
                    <span className="board-cell-muted">
                      {p.quantity} sold · {formatPrice(p.revenue)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}
