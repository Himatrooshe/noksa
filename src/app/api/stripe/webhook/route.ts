import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { cancelUnpaidCheckout, markCheckoutPaid } from "@/lib/orders-server";
import { getStripe, stripeWebhookSecret } from "@/lib/stripe-server";

export const runtime = "nodejs";

const paymentIntentId = (session: Stripe.Checkout.Session) =>
  typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);

/**
 * Stripe webhook: marks checkout orders paid, and cancels (restocking) those
 * whose payment never completed. Every handler is idempotent because Stripe
 * may deliver an event more than once.
 */
export async function POST(request: NextRequest) {
  let event: Stripe.Event;
  try {
    const signature = request.headers.get("stripe-signature") ?? "";
    event = getStripe().webhooks.constructEvent(await request.text(), signature, stripeWebhookSecret());
  } catch (error) {
    console.error("Rejected Stripe webhook", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        if (session.payment_status === "paid") await markCheckoutPaid(session.id, paymentIntentId(session));
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed":
        await cancelUnpaidCheckout({ sessionId: event.data.object.id });
        break;
    }
  } catch (error) {
    console.error(`Stripe webhook ${event.type} failed`, error);
    // A 500 makes Stripe retry later.
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
