import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearBag } from "@/components/clear-bag";
import { Icon } from "@/components/icons";
import { getCheckoutConfirmation } from "@/lib/orders-server";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order confirmed", robots: { index: false, follow: false } };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId = "" } = await searchParams;
  const order = await getCheckoutConfirmation(orderId);
  if (!order) notFound();

  const paid = order.paymentStatus === "paid";
  const cancelled = order.status === "cancelled";
  return (
    <main id="main-content" className="container confirmation-page">
      {!cancelled && <ClearBag pending={!paid} />}
      <div className="confirmation-card">
        <span className={cancelled ? "confirmation-mark is-cancelled" : "confirmation-mark"} aria-hidden="true">
          {cancelled ? "!" : <Icon name="leaf" />}
        </span>
        <p className="eyebrow">Order #{order.orderNumber}</p>
        {cancelled ? (
          <>
            <h1>This order was cancelled.</h1>
            <p>The payment wasn’t completed, so nothing was charged. Your items are still in your bag.</p>
            <Link href="/checkout" className="button">
              Return to checkout <Icon name="arrow" />
            </Link>
          </>
        ) : (
          <>
            <h1>
              Thank you, <span>it’s on its way</span>.
            </h1>
            <p>
              {paid
                ? `Your payment is confirmed${order.email ? ` and a receipt is on its way to ${order.email}` : ""}. We’ll let you know when your order ships.`
                : "We’re confirming your payment with Stripe. This page updates on its own in a few seconds."}
            </p>
            <ul className="confirmation-lines">
              {order.lines.map((line, index) => (
                <li key={index}>
                  <span>
                    {line.name} <em>× {line.quantity}</em>
                  </span>
                  <span>{formatPrice(line.unitPrice * line.quantity)}</span>
                </li>
              ))}
              <li>
                <span>Shipping</span>
                <span>{order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</span>
              </li>
              <li className="confirmation-total">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </li>
            </ul>
            <Link href="/shop" className="button">
              Continue shopping <Icon name="arrow" />
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
