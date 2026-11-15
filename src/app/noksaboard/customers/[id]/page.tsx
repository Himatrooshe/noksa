import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatPrice } from "@/lib/products";
import { formatDate, formatOrderNumber } from "@/lib/orders";
import { getCustomerById } from "@/lib/orders-server";
import { ActionForm } from "../../action-form";
import { Card, FulfillmentBadge, OrderStatusBadge, PageHeader, PaymentBadge } from "../../board-ui";
import { updateCustomerAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Customer" };

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerById(id);
  if (!customer) notFound();

  return (
    <>
      <PageHeader
        title={customer.name}
        back={{ href: "/noksaboard/customers", label: "Back to customers" }}
        subtitle={`Customer since ${formatDate(customer.createdAt)}`}
      />
      <div className="board-stat-grid">
        <div className="board-stat-card">
          <span className="board-stat-label">Amount spent</span>
          <span className="board-stat-value">{formatPrice(customer.amountSpent)}</span>
        </div>
        <div className="board-stat-card">
          <span className="board-stat-label">Orders</span>
          <span className="board-stat-value">{customer.orderCount}</span>
        </div>
      </div>
      <div className="board-editor-grid">
        <div className="board-editor-main">
          <Card title="Orders" flush>
            {customer.orders.length === 0 ? (
              <p className="board-hint board-card-pad">No orders yet.</p>
            ) : (
              <table className="board-table">
                <tbody>
                  {customer.orders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Link href={`/noksaboard/orders/${o.id}`} className="board-cell-link">
                          {formatOrderNumber(o.orderNumber)}
                        </Link>{" "}
                        <OrderStatusBadge status={o.status} />
                      </td>
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
          <Card title="Details">
            <ActionForm action={updateCustomerAction.bind(null, customer.id)} submitLabel="Save">
              <label className="board-field">
                Name
                <input className="board-input" name="name" required defaultValue={customer.name} />
              </label>
              <label className="board-field">
                Phone
                <input className="board-input" name="phone" type="tel" required defaultValue={customer.phone} />
              </label>
              <label className="board-field">
                Email
                <input className="board-input" name="email" type="email" defaultValue={customer.email ?? ""} />
              </label>
              <label className="board-field">
                Address
                <textarea className="board-input" name="address" rows={3} defaultValue={customer.address ?? ""} />
              </label>
              <label className="board-field">
                City / district
                <input className="board-input" name="city" defaultValue={customer.city ?? ""} />
              </label>
              <label className="board-field">
                Notes
                <textarea className="board-input" name="note" rows={3} defaultValue={customer.note} />
              </label>
            </ActionForm>
          </Card>
        </aside>
      </div>
    </>
  );
}
