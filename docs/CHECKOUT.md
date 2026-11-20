# Online checkout (Stripe)

Shoppers check out at `/checkout`, enter contact details and a US shipping address, and pay on Stripe's hosted payment page (card, Apple Pay, Google Pay). Card details never reach this app.

## Flow

1. `POST /api/checkout` validates the form, re-prices the bag from the database (browser prices are ignored), checks stock, and creates an order with payment status **pending** and payment method **Card (Stripe)**. Creating the order reserves stock.
2. The route opens a Stripe Checkout Session (30-minute expiry) and redirects the shopper to it. The session id is stored on the order.
3. On payment, Stripe calls `POST /api/stripe/webhook`; `checkout.session.completed` marks the order **paid**. The shopper lands on `/checkout/success`, which empties their bag and shows the order.
4. If the shopper leaves the Stripe page, `/api/checkout/cancel` expires the session, cancels the order and restocks it. If they simply walk away, Stripe sends `checkout.session.expired` after 30 minutes and the webhook does the same.

Cancellation is a single atomic statement, so a webhook and a return visit cannot restock twice. A payment that arrives for an already-cancelled order is never applied silently; the order gets a timeline note asking for a refund or a manual restore.

## Shipping

Defined in `src/lib/checkout-rules.mjs`: a $7 flat rate, free on orders of $75 or more (whole US dollars, like all catalog prices). Sales tax is not calculated or collected.

## Setup

1. Apply migration `db/migrations/005_card_checkout.sql` (`npm run db:migrate`; production deploys run it through `npm run build:production`).
2. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `.env.local` and on the host. Start with test-mode keys.
3. In the Stripe dashboard, add a webhook endpoint for `https://YOUR-DOMAIN/api/stripe/webhook` with the events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `checkout.session.expired`. Copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Locally, forward events with the Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`, and use the `whsec_...` it prints.
5. Test with card `4242 4242 4242 4242`, any future expiry and any CVC.

Without `STRIPE_SECRET_KEY`, the checkout page still renders but submitting shows "Online payments aren't set up yet."

## Before taking real orders

The FAQ, shipping, returns and contact pages still say the store does not accept orders. Update them (and decide on sales tax) before switching to live keys.
