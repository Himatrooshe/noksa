"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "./cart-provider";
import { Icon } from "./icons";
import { formatPrice, hasRealVariants } from "@/lib/products";
import { imageUrl } from "@/lib/image-url";
import { FREE_SHIPPING_MIN, US_STATES, shippingFor } from "@/lib/checkout-rules.mjs";

type FieldErrors = Partial<Record<"email" | "phone" | "name" | "address1" | "city" | "state" | "zip", string>>;

function Field({
  label,
  name,
  error,
  optional,
  wide,
  ...input
}: {
  label: string;
  name: keyof FieldErrors | "address2";
  error?: string;
  optional?: boolean;
  wide?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `checkout-${name}`;
  const classes = ["checkout-field", wide && "span-2", error && "has-error"].filter(Boolean).join(" ");
  return (
    <label className={classes} htmlFor={id}>
      <span>
        {label}
        {optional && <em> (optional)</em>}
      </span>
      <input id={id} name={name} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...input} />
      {error && (
        <small id={`${id}-error`} role="alert">
          {error}
        </small>
      )}
    </label>
  );
}

export function CheckoutForm({ cancelled }: { cancelled: boolean }) {
  const { lines, ready, update } = useCart();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = lines.reduce((sum, line) => sum + line.variant.price * line.quantity, 0);
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;
  const toFree = Math.max(0, FREE_SHIPPING_MIN - subtotal);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setFormError(null);
    setErrors({});
    setSubmitting(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, items: lines.map((line) => ({ id: line.id, quantity: line.quantity })) }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && typeof result.url === "string") {
        window.location.assign(result.url);
        return;
      }
      setErrors(result.fields ?? {});
      setFormError(result.error ?? "Something went wrong. Please try again.");
    } catch {
      setFormError("We couldn't reach the store. Check your connection and try again.");
    }
    setSubmitting(false);
  }

  if (!ready) {
    return <div className="checkout-loading" aria-busy="true" aria-label="Loading your bag" />;
  }

  if (lines.length === 0) {
    return (
      <div className="checkout-empty">
        <Icon name="bag" width="48" height="48" />
        <h2>Your bag is empty.</h2>
        <p>Add something you love, then come back to check out.</p>
        <Link href="/shop" className="button">
          Explore the collection <Icon name="arrow" />
        </Link>
      </div>
    );
  }

  return (
    <form className="checkout-grid" onSubmit={onSubmit} noValidate>
      <div className="checkout-main">
        {cancelled && (
          <p className="checkout-notice" role="status">
            Payment wasn’t completed, so nothing was charged. Your bag is saved: you can try again whenever you’re
            ready.
          </p>
        )}

        <fieldset className="checkout-section">
          <legend>
            <span className="checkout-step">1</span> Contact
          </legend>
          <div className="checkout-fields">
            <Field label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
            <Field label="Phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="(555) 555-0123" required error={errors.phone} />
          </div>
          <p className="checkout-hint">We’ll send your order confirmation here, and only contact you about this order.</p>
        </fieldset>

        <fieldset className="checkout-section">
          <legend>
            <span className="checkout-step">2</span> Shipping address
          </legend>
          <div className="checkout-fields">
            <Field label="Full name" name="name" autoComplete="shipping name" required error={errors.name} wide />
            <Field label="Street address" name="address1" autoComplete="shipping address-line1" required error={errors.address1} wide />
            <Field label="Apartment, suite, etc." name="address2" autoComplete="shipping address-line2" optional wide />
            <Field label="City" name="city" autoComplete="shipping address-level2" required error={errors.city} />
            <label className={errors.state ? "checkout-field has-error" : "checkout-field"} htmlFor="checkout-state">
              <span>State</span>
              <select id="checkout-state" name="state" autoComplete="shipping address-level1" required defaultValue="" aria-invalid={Boolean(errors.state)}>
                <option value="" disabled>
                  Choose…
                </option>
                {US_STATES.map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.state && <small role="alert">{errors.state}</small>}
            </label>
            <Field label="ZIP code" name="zip" autoComplete="shipping postal-code" inputMode="numeric" required error={errors.zip} />
            <label className="checkout-field">
              <span>Country</span>
              <input value="United States" readOnly tabIndex={-1} aria-readonly="true" />
            </label>
          </div>
        </fieldset>

        <fieldset className="checkout-section">
          <legend>
            <span className="checkout-step">3</span> Payment
          </legend>
          <div className="checkout-pay-note">
            <Icon name="leaf" />
            <p>
              You’ll pay on Stripe’s secure page: card, Apple Pay or Google Pay. Your card details never touch our
              servers.
            </p>
          </div>
        </fieldset>
      </div>

      <aside className="checkout-summary" aria-label="Order summary">
        <h2>Order summary</h2>
        <ul className="checkout-lines">
          {lines.map((line) => (
            <li key={line.id}>
              <span className="checkout-thumb">
                {line.product.image && <img src={imageUrl(line.product.image, 160)} alt="" />}
                <span className="checkout-qty-badge">{line.quantity}</span>
              </span>
              <span className="checkout-line-text">
                <Link href={`/shop/${line.product.slug}`}>{line.product.name}</Link>
                {hasRealVariants(line.product) && <small>{line.variant.title}</small>}
                <span className="checkout-stepper" role="group" aria-label={`${line.product.name} quantity`}>
                  <button type="button" onClick={() => update(line.id, line.quantity - 1)} aria-label="Decrease quantity">
                    −
                  </button>
                  <span>{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => update(line.id, line.quantity + 1)}
                    disabled={line.quantity >= line.max}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </span>
              </span>
              <span className="checkout-line-price">
                {formatPrice(line.variant.price * line.quantity)}
                {line.variant.compareAtPrice && line.variant.compareAtPrice > line.variant.price && (
                  <s>{formatPrice(line.variant.compareAtPrice * line.quantity)}</s>
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="checkout-free" aria-live="polite">
          {toFree > 0 ? (
            <p>
              Add <strong>{formatPrice(toFree)}</strong> more for free shipping.
            </p>
          ) : (
            <p>
              <strong>You’ve unlocked free shipping.</strong>
            </p>
          )}
          <span className="checkout-free-bar" aria-hidden="true">
            <span style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_MIN) * 100)}%` }} />
          </span>
        </div>

        <dl className="checkout-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div>
            <dt>Shipping</dt>
            <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
          </div>
          <div className="checkout-grand">
            <dt>Total</dt>
            <dd>
              <small>USD</small> {formatPrice(total)}
            </dd>
          </div>
        </dl>

        {formError && (
          <p className="checkout-error" role="alert">
            {formError}
          </p>
        )}
        <button className="button checkout-submit" type="submit" disabled={submitting}>
          {submitting ? "Opening secure payment…" : `Continue to payment · ${formatPrice(total)}`}
          {!submitting && <Icon name="arrow" />}
        </button>
        <p className="checkout-secure">Secure payment by Stripe · Prices in US dollars</p>
      </aside>
    </form>
  );
}
