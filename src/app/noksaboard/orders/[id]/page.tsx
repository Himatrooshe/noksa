import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatPrice } from "@/lib/products";
import {
  formatDateTime,
  formatOrderNumber,
  PAYMENT_METHODS,
  paymentMethodLabel,
} from "@/lib/orders";
import { getOrderById } from "@/lib/orders-server";
import { ActionForm } from "../../action-form";
import { Card, FulfillmentBadge, OrderStatusBadge, PageHeader, PaymentBadge } from "../../board-ui";
import {
  archiveAction,
  cancelAction,
  commentAction,
  deliveredAction,
  fulfillAction,
  markPaidAction,
  noteAction,
  refundAction,
} from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order" };

const COURIERS = ["Pathao", "Steadfast", "RedX", "Paperfly", "Sundarban", "SA Paribahan", "Hand delivery"];

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const order = await getOrderById(id);
  if (!order) notFound();
  const isOpen = order.status === "open";

  return (
    <>
      <PageHeader
        title={formatOrderNumber(order.orderNumber)}
        back={{ href: "/noksaboard/orders", label: "Back to orders" }}
        badges={
          <>
            <PaymentBadge status={order.paymentStatus} />
            <FulfillmentBadge status={order.fulfillmentStatus} />
            <OrderStatusBadge status={order.status} />
          </>
        }
        subtitle={formatDateTime(order.createdAt)}
        actions={
          order.status !== "cancelled" && (
            <ActionForm
              action={archiveAction.bind(null, order.id, isOpen)}
              submitLabel={isOpen ? "Archive" : "Unarchive"}
              variant="secondary"
              className="board-inline-action"
            />
          )
        }
      />
      {created && <p className="board-banner board-banner-success">Order created.</p>}

      <div className="board-editor-grid">
        <div className="board-editor-main">
          <Card title={`Items (${order.itemCount})`} flush>
            <table className="board-table">
              <tbody>
                {order.lines.map((line) => (
                  <tr key={line.id}>
                    <td>
                      {line.productId ? (
                        <Link href={`/noksaboard/products/${line.productId}`} className="board-cell-link">
                          {line.productName}
                        </Link>
                      ) : (
                        <span className="board-cell-strong">{line.productName}</span>
                      )}
                      {line.variantTitle && <div className="board-cell-muted">{line.variantTitle}</div>}
                      {line.sku && <div className="board-cell-muted">SKU {line.sku}</div>}
                    </td>
                    <td className="board-cell-muted">
                      {formatPrice(line.unitPrice)} × {line.quantity}
                    </td>
                    <td className="board-cell-right">{formatPrice(line.unitPrice * line.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="Fulfillment" actions={<FulfillmentBadge status={order.fulfillmentStatus} />}>
            {order.fulfillmentStatus === "unfulfilled" && isOpen && (
              <ActionForm action={fulfillAction.bind(null, order.id)} submitLabel="Mark as shipped">
                <div className="board-form-row">
                  <label className="board-field">
                    Courier
                    <input className="board-input" name="courier" list="couriers" placeholder="Pathao, Steadfast…" />
                    <datalist id="couriers">
                      {COURIERS.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </label>
                  <label className="board-field">
                    Tracking / consignment ID
                    <input className="board-input" name="trackingNumber" />
                  </label>
                </div>
              </ActionForm>
            )}
            {order.fulfillmentStatus !== "unfulfilled" && (
              <dl className="board-detail-list">
                <dt>Courier</dt>
                <dd>{order.courier ?? "—"}</dd>
                <dt>Tracking</dt>
                <dd>{order.trackingNumber ?? "—"}</dd>
                {order.fulfilledAt && (
                  <>
                    <dt>Shipped</dt>
                    <dd>{formatDateTime(order.fulfilledAt)}</dd>
                  </>
                )}
                {order.deliveredAt && (
                  <>
                    <dt>Delivered</dt>
                    <dd>{formatDateTime(order.deliveredAt)}</dd>
                  </>
                )}
              </dl>
            )}
            {order.fulfillmentStatus === "fulfilled" && isOpen && (
              <ActionForm action={deliveredAction.bind(null, order.id)} submitLabel="Mark as delivered" variant="secondary" />
            )}
            {order.status === "cancelled" && <p className="board-hint">This order was cancelled.</p>}
          </Card>

          <Card title="Payment" actions={<PaymentBadge status={order.paymentStatus} />}>
            <dl className="board-summary">
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
              <dt>Shipping</dt>
              <dd>{formatPrice(order.shippingFee)}</dd>
              {order.discount > 0 && (
                <>
                  <dt>Discount</dt>
                  <dd>−{formatPrice(order.discount)}</dd>
                </>
              )}
              <dt className="board-summary-total">Total</dt>
              <dd className="board-summary-total">{formatPrice(order.total)}</dd>
              <dt>Method</dt>
              <dd>{paymentMethodLabel(order.paymentMethod)}</dd>
              {order.transactionId && (
                <>
                  <dt>Transaction ID</dt>
                  <dd>{order.transactionId}</dd>
                </>
              )}
              {order.paidAt && (
                <>
                  <dt>Paid</dt>
                  <dd>{formatDateTime(order.paidAt)}</dd>
                </>
              )}
            </dl>
            {order.paymentStatus === "pending" && order.status !== "cancelled" && (
              <ActionForm action={markPaidAction.bind(null, order.id)} submitLabel={`Mark ${formatPrice(order.total)} as paid`}>
                <div className="board-form-row">
                  <label className="board-field">
                    Received via
                    <select className="board-input" name="paymentMethod" defaultValue={order.paymentMethod}>
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="board-field">
                    Transaction ID (bKash/Nagad/bank)
                    <input className="board-input" name="transactionId" />
                  </label>
                </div>
              </ActionForm>
            )}
            {order.paymentStatus === "paid" && (
              <ActionForm
                action={refundAction.bind(null, order.id)}
                submitLabel="Mark as refunded"
                variant="secondary"
                confirm="Mark this order's payment as refunded? Send the money back to the customer separately."
              />
            )}
          </Card>

          <Card title="Timeline">
            <ActionForm action={commentAction.bind(null, order.id)} submitLabel="Post" variant="secondary" className="board-inline-form">
              <input className="board-input" name="comment" placeholder="Leave a comment…" aria-label="Comment" />
            </ActionForm>
            <ol className="board-timeline">
              {order.events.map((e) => (
                <li key={e.id}>
                  <span>{e.message}</span>
                  <time dateTime={e.createdAt}>{formatDateTime(e.createdAt)}</time>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <aside className="board-editor-side">
          <Card title="Customer">
            {order.customerId ? (
              <Link href={`/noksaboard/customers/${order.customerId}`} className="board-cell-link">
                {order.customerName}
              </Link>
            ) : (
              <p className="board-cell-strong">{order.customerName}</p>
            )}
            <dl className="board-detail-list board-detail-stacked">
              <dt>Phone</dt>
              <dd>{order.customerPhone ? <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a> : "—"}</dd>
              {order.customerEmail && (
                <>
                  <dt>Email</dt>
                  <dd>{order.customerEmail}</dd>
                </>
              )}
              <dt>Shipping address</dt>
              <dd>{order.shippingAddress ?? "—"}</dd>
            </dl>
          </Card>
          <Card title="Notes">
            <ActionForm action={noteAction.bind(null, order.id)} submitLabel="Save note" variant="secondary">
              <textarea className="board-input" name="note" rows={4} defaultValue={order.note} aria-label="Order note" />
            </ActionForm>
          </Card>
          {order.status !== "cancelled" && order.fulfillmentStatus !== "delivered" && (
            <Card title="Cancel order">
              <ActionForm
                action={cancelAction.bind(null, order.id)}
                submitLabel="Cancel order"
                variant="danger"
                confirm="Cancel this order? This can't be undone."
              >
                <label className="board-check">
                  <input type="checkbox" name="restock" defaultChecked />
                  Put items back in stock
                </label>
                {order.paymentStatus === "paid" && (
                  <p className="board-hint">This order is paid — refund the customer separately, then mark it refunded.</p>
                )}
              </ActionForm>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
