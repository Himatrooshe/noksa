import { NextRequest, NextResponse } from "next/server";
import { validateCheckout, shippingFor } from "@/lib/checkout-rules.mjs";
import {
  attachStripeSession,
  cancelUnpaidCheckout,
  createOrder,
  quoteCheckout,
} from "@/lib/orders-server";
import { getSiteUrl } from "@/lib/site-url";
import { getStripe, toCents } from "@/lib/stripe-server";

export const runtime = "nodejs";

/** Unpaid checkout orders hold their stock this long before Stripe expires the session. */
const SESSION_MINUTES = 30;

const fail = (status: number, error: string, fields?: Record<string, string>) =>
  NextResponse.json({ error, fields }, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Starts a checkout: re-prices the bag from the database, creates a pending
 * card order (which reserves stock), and returns a Stripe Checkout URL.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  let sameOrigin = false;
  try { sameOrigin = Boolean(origin && new URL(origin).host === request.headers.get("host")); } catch { /* reject */ }
  if (!sameOrigin) return fail(403, "Checkout must come from this site.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "We couldn't read your order. Refresh the page and try again.");
  }
  const result = validateCheckout(body);
  if (!result.ok) {
    const { items, ...fields } = result.errors as Record<string, string>;
    return fail(400, items ?? "Please check the highlighted fields.", fields);
  }
  const form = result.value;

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    return fail(503, error instanceof Error ? error.message : "Online payments aren't available.");
  }

  let quote;
  try {
    quote = await quoteCheckout(form.items.map((i) => ({ variantId: i.id, quantity: i.quantity })));
  } catch (error) {
    return fail(409, error instanceof Error ? error.message : "Your bag changed. Review it and try again.");
  }
  const subtotal = quote.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const shipping = shippingFor(subtotal);

  let orderId: string;
  try {
    orderId = await createOrder({
      source: "checkout",
      customer: {
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: [form.address1, form.address2].filter(Boolean).join(", "),
        city: `${form.city}, ${form.state} ${form.zip}`,
      },
      lines: quote.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
      shippingFee: shipping,
      discount: 0,
      paymentMethod: "card",
      markPaid: false,
      transactionId: null,
      note: "",
    });
  } catch (error) {
    return fail(409, error instanceof Error ? error.message : "We couldn't reserve your items. Try again.");
  }

  try {
    const site = await getSiteUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "usd",
      customer_email: form.email,
      client_reference_id: orderId,
      metadata: { order_id: orderId },
      line_items: quote.map((line) => ({
        quantity: line.quantity,
        price_data: { currency: "usd", unit_amount: toCents(line.unitPrice), product_data: { name: line.name } },
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: shipping === 0 ? "Free standard shipping" : "Standard shipping",
            fixed_amount: { amount: toCents(shipping), currency: "usd" },
          },
        },
      ],
      expires_at: Math.floor(Date.now() / 1000) + SESSION_MINUTES * 60,
      success_url: new URL(`/checkout/success?order=${orderId}`, site).href,
      cancel_url: new URL(`/api/checkout/cancel?order=${orderId}`, site).href,
    });
    if (!session.url) throw new Error("Stripe did not return a payment page.");
    await attachStripeSession(orderId, session.id);
    return NextResponse.json({ url: session.url }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    // Don't leave stock reserved for an order that can never be paid.
    await cancelUnpaidCheckout({ orderId }).catch(() => undefined);
    console.error("Stripe checkout session failed", error);
    return fail(502, "We couldn't open the secure payment page. Please try again in a moment.");
  }
}
