"use client";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  formatPrice,
  hasRealVariants,
  isVariantAvailable,
  type Product,
  type ProductVariant,
} from "@/lib/products";
import { Icon } from "./icons";
/** A bag line, keyed by variant id. */
type Item = { id: string; quantity: number };
const STORAGE_KEY = "noksa-bag-v2";
const MAX_QUANTITY = 20;
export type CartProduct = Pick<
  Product,
  "id" | "slug" | "name" | "trackInventory" | "continueSelling" | "options"
> & { image: string | null; variants: Pick<ProductVariant, "id" | "title" | "price" | "compareAtPrice" | "stock">[] };
/** A bag line resolved against the catalog, for the checkout page. */
export type CartLine = {
  id: string;
  quantity: number;
  max: number;
  product: CartProduct;
  variant: CartProduct["variants"][number];
};
const CartContext = createContext<{
  items: Item[];
  lines: CartLine[];
  ready: boolean;
  add: (id: string) => void;
  update: (id: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
} | null>(null);
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("Cart requires CartProvider");
  return context;
}
export function CartProvider({
  products,
  children,
}: {
  products: CartProduct[];
  children: ReactNode;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const lookup = useMemo(() => {
    const map = new Map<string, { product: CartProduct; variant: CartProduct["variants"][number] }>();
    for (const product of products) {
      for (const variant of product.variants) map.set(variant.id, { product, variant });
    }
    return map;
  }, [products]);
  /** Most you can put in the bag: stock for tracked items, else the cap. */
  function maxFor(id: string): number {
    const entry = lookup.get(id);
    if (!entry) return 0;
    const { product, variant } = entry;
    if (!product.trackInventory || product.continueSelling) return MAX_QUANTITY;
    return Math.max(0, Math.min(MAX_QUANTITY, variant.stock));
  }
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) {
        const seen = new Set<string>();
        setItems(
          saved.filter((item): item is Item => {
            if (
              !item ||
              typeof item.id !== "string" ||
              seen.has(item.id) ||
              !lookup.has(item.id) ||
              !Number.isInteger(item.quantity) ||
              item.quantity < 1 ||
              item.quantity > maxFor(item.id)
            )
              return false;
            seen.add(item.id);
            return true;
          }),
        );
      }
    } catch {
      /* A fresh bag remains usable when browser storage is unavailable. */
    }
    setReady(true);
    // Runs once on mount; the catalog is fixed for the life of the page.
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        /* Storage is optional. */
      }
    }
  }, [items, ready]);
  function update(id: string, quantity: number) {
    setItems((current) =>
      quantity < 1
        ? current.filter((i) => i.id !== id)
        : current.map((i) => (i.id === id ? { ...i, quantity: Math.min(maxFor(id), quantity) } : i)),
    );
  }
  function add(id: string) {
    const entry = lookup.get(id);
    if (!entry || !isVariantAvailable(entry.product, entry.variant)) return;
    setItems((current) =>
      current.some((i) => i.id === id)
        ? current.map((i) => (i.id === id ? { ...i, quantity: Math.min(i.quantity + 1, maxFor(id)) } : i))
        : [...current, { id, quantity: 1 }],
    );
    dialog.current?.showModal();
  }
  const total = items.reduce(
    (sum, item) => sum + (lookup.get(item.id)?.variant.price ?? 0) * item.quantity,
    0,
  );
  const lines: CartLine[] = items.flatMap((item) => {
    const entry = lookup.get(item.id);
    return entry ? [{ id: item.id, quantity: item.quantity, max: maxFor(item.id), ...entry }] : [];
  });
  return (
    <CartContext.Provider
      value={{ items, lines, ready, add, update, clear: () => setItems([]), open: () => dialog.current?.showModal() }}
    >
      {children}
      <dialog
        ref={dialog}
        className="bag-dialog"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        aria-labelledby="bag-title"
      >
        <div className="bag-header">
          <h2 id="bag-title">Your shopping bag</h2>
          <button
            className="icon-button"
            aria-label="Close shopping bag"
            onClick={() => dialog.current?.close()}
          >
            <Icon name="close" />
          </button>
        </div>
        {items.length === 0 ? (
          <div className="empty-bag">
            <Icon name="bag" width="48" height="48" />
            <h3>A little room for something lovely.</h3>
            <p>Your bag is empty. Explore our collection to find your everyday companion.</p>
            <Link href="/shop" className="button" onClick={() => dialog.current?.close()}>
              Explore the collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="bag-items">
              {items.map((item) => {
                const entry = lookup.get(item.id);
                if (!entry) return null;
                const { product, variant } = entry;
                return (
                  <li key={item.id}>
                    <div className="bag-item-top">
                      <Link href={`/shop/${product.slug}`} onClick={() => dialog.current?.close()}>
                        {product.name}
                        {hasRealVariants(product) && (
                          <span className="bag-variant"> — {variant.title}</span>
                        )}
                      </Link>
                      <strong>{formatPrice(variant.price * item.quantity)}</strong>
                    </div>
                    <div className="bag-item-bottom">
                      <div className="quantity">
                        <button
                          aria-label={`Decrease ${product.name} quantity`}
                          onClick={() => update(item.id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span aria-label="Quantity">{item.quantity}</span>
                        <button
                          disabled={item.quantity >= maxFor(item.id)}
                          aria-label={`Increase ${product.name} quantity`}
                          onClick={() => update(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button className="text-button" onClick={() => update(item.id, 0)}>
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="bag-total">
              <span>Subtotal</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <p className="bag-note">Shipping is calculated at checkout. Free on orders of $75 or more.</p>
            <Link href="/checkout" className="button full-width" onClick={() => dialog.current?.close()}>
              Checkout <Icon name="arrow" />
            </Link>
            <button className="text-button bag-continue" onClick={() => dialog.current?.close()}>
              Continue browsing
            </button>
          </>
        )}
      </dialog>
    </CartContext.Provider>
  );
}
export function AddToBag({ id, disabled = false }: { id: string; disabled?: boolean }) {
  const { add } = useCart();
  if (disabled) {
    return (
      <button className="button" disabled>
        Sold out
      </button>
    );
  }
  return (
    <button className="button" onClick={() => add(id)}>
      Add to bag <Icon name="bag" />
    </button>
  );
}
