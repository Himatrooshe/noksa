"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { formatPrice, hasRealVariants, type Product } from "@/lib/products";
import { ProductStatusBadge } from "../board-ui";
import { bulkProductsAction } from "./actions";
import { imageUrl } from "@/lib/image-url";

function inventoryText(p: Product): { text: string; warn: boolean } {
  if (!p.trackInventory) return { text: "Not tracked", warn: false };
  const variants = hasRealVariants(p) ? ` for ${p.variants.length} variants` : "";
  const warn = !p.continueSelling && p.variants.some((v) => v.stock <= 0);
  return { text: `${p.totalStock} in stock${variants}`, warn };
}

export function ProductTable({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [state, formAction, pending] = useActionState(bulkProductsAction, undefined);
  const allSelected = products.length > 0 && selected.size === products.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form
      action={(fd) => {
        formAction(fd);
        setSelected(new Set());
      }}
      onSubmit={(e) => {
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        if (
          submitter?.value === "delete" &&
          !window.confirm(`Delete ${selected.size} product${selected.size === 1 ? "" : "s"}? This can't be undone.`)
        ) {
          e.preventDefault();
        }
      }}
    >
      {[...selected].map((id) => (
        <input key={id} type="hidden" name="ids" value={id} />
      ))}
      {state?.error && <p className="board-banner board-banner-critical">{state.error}</p>}
      {state?.ok && <p className="board-banner board-banner-success">{state.ok}</p>}
      <div className="board-table-wrap">
        {selected.size > 0 && (
          <div className="board-bulkbar">
            <span>{selected.size} selected</span>
            <button className="board-button" name="op" value="active" disabled={pending}>
              Set as active
            </button>
            <button className="board-button" name="op" value="draft" disabled={pending}>
              Set as draft
            </button>
            <button className="board-button" name="op" value="archived" disabled={pending}>
              Archive
            </button>
            <button className="board-button board-button-danger" name="op" value="delete" disabled={pending}>
              Delete
            </button>
          </div>
        )}
        <table className="board-table">
          <thead>
            <tr>
              <th className="board-col-check">
                <input
                  type="checkbox"
                  aria-label="Select all products"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)))}
                />
              </th>
              <th aria-label="Image"></th>
              <th>Product</th>
              <th>Status</th>
              <th>Inventory</th>
              <th>Price</th>
              <th>Collections</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const inv = inventoryText(p);
              return (
                <tr key={p.id} className={selected.has(p.id) ? "is-selected" : undefined}>
                  <td className="board-col-check">
                    <input
                      type="checkbox"
                      aria-label={`Select ${p.name}`}
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                    />
                  </td>
                  <td>
                    {p.media[0] ? (
                      <img className="board-thumb" src={imageUrl(p.media[0].url, 100)} alt="" loading="lazy" />
                    ) : (
                      <span className="board-thumb board-thumb-swatch" style={{ background: p.color }} />
                    )}
                  </td>
                  <td>
                    <Link href={`/noksaboard/products/${p.id}`} className="board-cell-link">
                      {p.name}
                    </Link>
                  </td>
                  <td>
                    <ProductStatusBadge status={p.status} />
                  </td>
                  <td className={inv.warn ? "board-cell-warn" : undefined}>{inv.text}</td>
                  <td>
                    {hasRealVariants(p) && "From "}
                    {formatPrice(p.price)}
                  </td>
                  <td className="board-cell-muted">{p.collections.map((c) => c.title).join(", ") || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </form>
  );
}
