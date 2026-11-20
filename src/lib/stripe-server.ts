import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

/** Server-side Stripe client. Throws a readable error when the store isn't configured. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("Online payments aren't set up yet. Please try again later.");
  client ??= new Stripe(key);
  return client;
}

export function stripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) throw new Error("Missing STRIPE_WEBHOOK_SECRET.");
  return secret;
}

/** Whole dollars (how the catalog stores prices) to Stripe's smallest unit. */
export const toCents = (dollars: number) => Math.round(dollars * 100);
