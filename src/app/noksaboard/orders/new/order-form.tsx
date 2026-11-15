"use client";
import { useActionState, useMemo, useState } from "react";
import {
  formatPrice,
  hasRealVariants,
  isVariantAvailable,
  type Product,
  type ProductVariant,
} from "@/lib/products";
import { PAYMENT_METHODS } from "@/lib/orders";
import { createOrderAction, lookupCustomerAction, type NewOrderPayload } from "../actions";

type Line = { variantId: string; quantity: number };

export function OrderForm({ products }: { products: Product[] }) {
  const [state, formAction, pending] = useActionState(createOrderAction, undefined);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", address: "", city: "" });
  const [knownCustomer, setKnownCustomer] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [picker, setPicker] = useState("");
  const [shippingFee, setShippingFee] = useState("");
  const [discount, setDiscount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [markPaid, setMarkPaid] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [note, setNote] = useState("");

  const variants = useMemo(() => {
    const map = new Map<string, { product: Product; variant: ProductVariant }>();
    for (const product of products) for (const variant of product.variants) map.set(variant.id, { product, variant });
    return map;
  }, [products]);

  const subtotal = lines.reduce((sum, l) => sum + (variants.get(l.variantId)?.variant.price ?? 0) * l.quantity, 0);
  const shipping = /^\d+$/.test(shippingFee) ? Number(shippingFee) : 0;
  const disc = /^\d+$/.test(discount) ? Number(discount) : 0;
  const total = subtotal + shipping - disc;

  const payload: NewOrderPayload = {
    customer,
    lines,
    shippingFee,
    discount,
    paymentMethod,
    markPaid,
    transactionId,
    note,
  };

  function addLine() {
    if (!picker) return;
    setLines((prev) =>
      prev.some((l) => l.variantId === picker)
        ? prev.map((l) => (l.variantId === picker ? { ...l, quantity: l.quantity + 1 } : l))
        : [...prev, { variantId: picker, quantity: 1 }],
    );
    setPicker("");
  }

  async function lookupPhone() {
    if (!customer.phone.trim()) return;
    const found = await lookupCustomerAction(customer.phone);
    setKnownCustomer(Boolean(found));
    if (found) {
      setCustomer((c) => ({
        name: c.name || found.name,
        phone: c.phone,
        email: c.email || (found.email ?? ""),
        address: c.address || (found.address ?? ""),
        city: c.city || (found.city ?? ""),
      }));
    }
  }

  const needsTxn = markPaid && (paymentMethod === "bkash" || paymentMethod === "nagad" || paymentMethod === "bank_transfer");

  return (
    <form action={formAction} className="board-editor">
      <input type="hidden" name="payload" value={JSON.stringify(payload)} />
      {state?.error && (
        <p className="board-banner board-banner-critical" role="alert">
          {state.error}
        </p>
      )}
      <div className="board-editor-grid">
        <div className="board-editor-main">
          <section className="board-card">
            <h2 className="board-card-title">Products</h2>
            <div className="board-inline">
              <select
                className="board-input"
                value={picker}
                onChange={(e) => setPicker(e.target.value)}
                aria-label="Choose a product"
              >
                <option value="">Choose a product…</option>
                {products.map((p) =>
                  p.variants.map((v) => {
                    const stock = p.trackInventory ? ` · ${v.stock} in stock` : "";
                    const out = !isVariantAvailable(p, v);
                    return (
                      <option key={v.id} value={v.id} disabled={out}>
                        {p.name}
                        {hasRealVariants(p) ? ` — ${v.title}` : ""} · {formatPrice(v.price)}
                        {out ? " · sold out" : stock}
                      </option>
                    );
                  }),
                )}
              </select>
              <button type="button" className="board-button" onClick={addLine} disabled={!picker}>
                Add
              </button>
            </div>
            {lines.length > 0 && (
              <div className="board-table-wrap">
                <table className="board-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th aria-label="Remove"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line) => {
                      const entry = variants.get(line.variantId);
                      if (!entry) return null;
                      const { product, variant } = entry;
                      return (
                        <tr key={line.variantId}>
                          <td className="board-cell-strong">
                            {product.name}
                            {hasRealVariants(product) && <div className="board-cell-muted">{variant.title}</div>}
                          </td>
                          <td>{formatPrice(variant.price)}</td>
                          <td>
                            <input
                              className="board-input board-input-sm"
                              type="number"
                              min={1}
                              max={999}
                              value={line.quantity}
                              aria-label={`Quantity of ${product.name}`}
                              onChange={(e) =>
                                setLines((prev) =>
                                  prev.map((l) =>
                                    l.variantId === line.variantId
                                      ? { ...l, quantity: Math.max(1, Math.floor(Number(e.target.value) || 1)) }
                                      : l,
                                  ),
                                )
                              }
                            />
                          </td>
                          <td>{formatPrice(variant.price * line.quantity)}</td>
                          <td>
                            <button
                              type="button"
                              className="board-icon-button danger"
                              aria-label={`Remove ${product.name}`}
                              onClick={() => setLines((prev) => prev.filter((l) => l.variantId !== line.variantId))}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="board-card">
            <h2 className="board-card-title">Payment</h2>
            <div className="board-form-row">
              <label className="board-field">
                Shipping (USD)
                <input className="board-input" inputMode="numeric" value={shippingFee} placeholder="0" onChange={(e) => setShippingFee(e.target.value)} />
              </label>
              <label className="board-field">
                Discount (USD)
                <input className="board-input" inputMode="numeric" value={discount} placeholder="0" onChange={(e) => setDiscount(e.target.value)} />
              </label>
            </div>
            <dl className="board-summary">
              <dt>Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
              <dt>Shipping</dt>
              <dd>{formatPrice(shipping)}</dd>
              {disc > 0 && (
                <>
                  <dt>Discount</dt>
                  <dd>−{formatPrice(disc)}</dd>
                </>
              )}
              <dt className="board-summary-total">Total</dt>
              <dd className="board-summary-total">{formatPrice(Math.max(0, total))}</dd>
            </dl>
            <div className="board-form-row">
              <label className="board-field">
                Payment method
                <select className="board-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
              {markPaid && paymentMethod !== "cod" && (
                <label className="board-field">
                  Transaction ID {needsTxn ? "" : "(optional)"}
                  <input className="board-input" value={transactionId} required={needsTxn} onChange={(e) => setTransactionId(e.target.value)} />
                </label>
              )}
            </div>
            <label className="board-check">
              <input type="checkbox" checked={markPaid} onChange={(e) => setMarkPaid(e.target.checked)} />
              Payment already received
            </label>
            <p className="board-hint">
              Leave unticked for cash on delivery — mark it paid from the order once the courier pays out.
            </p>
          </section>
        </div>

        <aside className="board-editor-side">
          <section className="board-card">
            <h2 className="board-card-title">Customer</h2>
            <label className="board-field">
              Phone
              <input
                className="board-input"
                type="tel"
                required
                value={customer.phone}
                placeholder="01XXXXXXXXX"
                onChange={(e) => {
                  setCustomer({ ...customer, phone: e.target.value });
                  setKnownCustomer(false);
                }}
                onBlur={lookupPhone}
              />
            </label>
            {knownCustomer && <p className="board-hint">Returning customer — details filled in.</p>}
            <label className="board-field">
              Name
              <input className="board-input" required value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
            </label>
            <label className="board-field">
              Address
              <textarea className="board-input" rows={3} value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
            </label>
            <label className="board-field">
              City / district
              <input className="board-input" value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} />
            </label>
            <label className="board-field">
              Email (optional)
              <input className="board-input" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
            </label>
          </section>
          <section className="board-card">
            <label className="board-field">
              Note
              <textarea
                className="board-input"
                rows={3}
                value={note}
                placeholder="e.g. Ordered via Facebook, gift wrap"
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
          </section>
        </aside>
      </div>
      <div className="board-editor-footer">
        <button type="submit" className="board-button board-button-primary" disabled={pending || lines.length === 0}>
          {pending ? "Creating…" : "Create order"}
        </button>
      </div>
    </form>
  );
}
