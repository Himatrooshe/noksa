import { NextRequest, NextResponse } from "next/server";
import { cancelUnpaidCheckout } from "@/lib/orders-server";
import { sql } from "@/lib/db";
import { isUuid } from "@/lib/products-server";
import { getStripe } from "@/lib/stripe-server";

export const runtime = "nodejs";

/**
 * Where Stripe sends a customer who leaves the payment page. Expires the
 * session so it can't be paid later, releases the reserved stock, and returns
 * the customer to checkout with their bag intact.
 */
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order") ?? "";
  if (isUuid(orderId)) {
    try {
      const [order] = (await sql`
        select stripe_session_id from orders
        where id = ${orderId} and payment_status = 'pending' and status = 'open' and payment_method = 'card'
      `) as unknown as { stripe_session_id: string | null }[];
      if (order?.stripe_session_id) {
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
        // A completed session is (or is about to be) paid: never cancel it from here.
        if (session.status === "open") {
          await stripe.checkout.sessions.expire(session.id);
          await cancelUnpaidCheckout({ orderId });
        } else if (session.status === "expired") {
          await cancelUnpaidCheckout({ orderId });
        }
      }
    } catch (error) {
      // The session still expires on its own and the webhook then releases the stock.
      console.error("Checkout cancel cleanup failed", error);
    }
  }
  return NextResponse.redirect(new URL("/checkout?cancelled=1", request.url), 303);
}
