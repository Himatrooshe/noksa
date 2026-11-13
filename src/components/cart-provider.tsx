"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { products, formatPrice } from "@/lib/products";
import { Icon } from "./icons";
type Item = { id: string; quantity: number };
const CartContext = createContext<{
  items: Item[];
  add: (id: string) => void;
  open: () => void;
} | null>(null);
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("Cart requires CartProvider");
  return context;
}
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem("noksa-bag") || "[]");
      if (Array.isArray(saved)) {
        const seen = new Set<string>();
        setItems(
          saved.filter((item): item is Item => {
            if (
              !item ||
              typeof item.id !== "string" ||
              seen.has(item.id) ||
              !products.some((p) => p.id === item.id) ||
              !Number.isInteger(item.quantity) ||
              item.quantity < 1 ||
              item.quantity > 20
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
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("noksa-bag", JSON.stringify(items));
      } catch {
        /* Storage is optional. */
      }
    }
  }, [items, ready]);
  function update(id: string, quantity: number) {
    setItems((current) =>
      quantity < 1
        ? current.filter((i) => i.id !== id)
        : current.map((i) => (i.id === id ? { ...i, quantity: Math.min(20, quantity) } : i)),
    );
  }
  function add(id: string) {
    if (!products.some((p) => p.id === id)) return;
    setItems((current) =>
      current.some((i) => i.id === id)
        ? current.map((i) => (i.id === id ? { ...i, quantity: Math.min(i.quantity + 1, 20) } : i))
        : [...current, { id, quantity: 1 }],
    );
    dialog.current?.showModal();
  }
  const total = items.reduce(
    (sum, item) => sum + products.find((p) => p.id === item.id)!.price * item.quantity,
    0,
  );
  return (
    <CartContext.Provider value={{ items, add, open: () => dialog.current?.showModal() }}>
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
                const product = products.find((p) => p.id === item.id)!;
                return (
                  <li key={item.id}>
                    <div className="bag-item-top">
                      <Link href={`/shop/${item.id}`} onClick={() => dialog.current?.close()}>
                        {product.name}
                      </Link>
                      <strong>{formatPrice(product.price * item.quantity)}</strong>
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
                          disabled={item.quantity >= 20}
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
            <p className="bag-note">
              This is a sample collection. Ordering and payments will be available when the store
              launches.
            </p>
            <button className="button full-width" onClick={() => dialog.current?.close()}>
              Continue browsing
            </button>
          </>
        )}
      </dialog>
    </CartContext.Provider>
  );
}
export function AddToBag({ id }: { id: string }) {
  const { add } = useCart();
  return (
    <button className="button" onClick={() => add(id)}>
      Add to bag <Icon name="bag" />
    </button>
  );
}
