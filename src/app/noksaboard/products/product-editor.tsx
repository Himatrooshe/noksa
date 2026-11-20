"use client";
import { MAX_SAVED_IMAGE_BYTES, MAX_SOURCE_IMAGE_BYTES, resizeImage } from "../upload-image";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  slugify,
  type CollectionRef,
  type Product,
  type ProductShape,
  type ProductStatus,
} from "@/lib/products";
import type { ActionResult, FormAction } from "../action-form";
import type { ProductPayload } from "./actions";
import { RichTextEditor } from "./rich-text-editor";

type MediaRow = { key: string; url: string; alt: string };
type OptionRow = { key: string; name: string; values: string[]; draft: string };
type VariantRow = ProductPayload["variants"][number];

const COLOR_SWATCHES = [
  { name: "Natural jute", value: "#bba078" },
  { name: "Forest", value: "#315c45" },
  { name: "Olive", value: "#6f7445" },
  { name: "Terracotta", value: "#a94f39" },
  { name: "Indigo", value: "#344d73" },
  { name: "Charcoal", value: "#3d3b38" },
];
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

type EditorState = {
  name: string;
  handle: string;
  handleTouched: boolean;
  status: ProductStatus;
  descriptionHtml: string;
  dimensions: string;
  color: string;
  shape: ProductShape;
  trackInventory: boolean;
  continueSelling: boolean;
  media: MediaRow[];
  options: OptionRow[];
  variants: VariantRow[];
  collectionIds: string[];
};

let keySeq = 0;
const newKey = () => `k${++keySeq}`;

function initialState(product?: Product): EditorState {
  if (!product) {
    return {
      name: "",
      handle: "",
      handleTouched: false,
      status: "draft",
      descriptionHtml: "",
      dimensions: "",
      color: "#bba078",
      shape: "tote",
      trackInventory: true,
      continueSelling: false,
      media: [],
      options: [],
      variants: [{ id: null, options: [], price: "", compareAtPrice: "", sku: "", stock: "0" }],
      collectionIds: [],
    };
  }
  return {
    name: product.name,
    handle: product.slug,
    handleTouched: true,
    status: product.status,
    descriptionHtml: product.description,
    dimensions: product.dimensions,
    color: product.color,
    shape: product.shape,
    trackInventory: product.trackInventory,
    continueSelling: product.continueSelling,
    media: product.media.map((m) => ({ key: m.id, url: m.url, alt: m.alt })),
    options: product.options.map((o) => ({ key: newKey(), name: o.name, values: o.values, draft: "" })),
    variants: product.variants.map((v) => ({
      id: v.id,
      options: v.options,
      price: String(v.price),
      compareAtPrice: v.compareAtPrice === null ? "" : String(v.compareAtPrice),
      sku: v.sku ?? "",
      stock: String(v.stock),
    })),
    collectionIds: product.collections.map((c) => c.id),
  };
}

/** Every combination of option values, in option order. */
function combinations(options: OptionRow[]): string[][] {
  const usable = options.filter((o) => o.values.length > 0);
  return usable.reduce<string[][]>(
    (acc, option) => acc.flatMap((combo) => option.values.map((v) => [...combo, v])),
    [[]],
  );
}

/** Rebuild variants after options change, keeping data for combinations
 * that still exist (and the old default variant's id/price for the first). */
function regenerateVariants(options: OptionRow[], previous: VariantRow[]): VariantRow[] {
  const byKey = new Map(previous.map((v) => [v.options.join("\u0000"), v]));
  const template = previous[0] ?? { id: null, options: [], price: "", compareAtPrice: "", sku: "", stock: "0" };
  const usedIds = new Set<string>();
  const combos = combinations(options);
  return combos.map((combo, index) => {
    const existing = byKey.get(combo.join("\u0000"));
    if (existing) {
      if (existing.id) usedIds.add(existing.id);
      return { ...existing, options: combo };
    }
    // Reuse the old default variant (no options) for the first combination,
    // so going from "no options" to "has options" keeps its id and stock.
    const reuse = index === 0 && template.options.length === 0 && template.id && !usedIds.has(template.id);
    if (reuse && template.id) usedIds.add(template.id);
    return {
      id: reuse ? template.id : null,
      options: combo,
      price: template.price,
      compareAtPrice: template.compareAtPrice,
      sku: reuse ? template.sku : "",
      stock: reuse ? template.stock : "0",
    };
  });
}

function toPayload(s: EditorState): ProductPayload {
  return {
    name: s.name,
    handle: s.handle,
    status: s.status,
    descriptionHtml: s.descriptionHtml,
    dimensions: s.dimensions,
    color: s.color,
    shape: s.shape,
    trackInventory: s.trackInventory,
    continueSelling: s.continueSelling,
    media: s.media.map(({ url, alt }) => ({ url, alt })),
    options: s.options.filter((o) => o.name.trim() || o.values.length).map(({ name, values }) => ({ name, values })),
    variants: s.variants,
    collectionIds: s.collectionIds,
  };
}

export function ProductEditor({
  product,
  collections,
  action,
}: {
  product?: Product;
  collections: CollectionRef[];
  action: FormAction;
}) {
  const [baseline, setBaseline] = useState(() => initialState(product));
  const [s, setS] = useState(baseline);
  const [editorKey, setEditorKey] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [mediaMessage, setMediaMessage] = useState("");
  const [imageFailures, setImageFailures] = useState<Set<string>>(() => new Set());
  const [processingImage, setProcessingImage] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(action, undefined);

  const payload = useMemo(() => JSON.stringify(toPayload(s)), [s]);
  const baselinePayload = useMemo(() => JSON.stringify(toPayload(baseline)), [baseline]);
  const dirty = payload !== baselinePayload;

  // After a successful save, the current state becomes the new baseline.
  const lastResult = useRef<ActionResult>(undefined);
  useEffect(() => {
    if (state && state !== lastResult.current) {
      lastResult.current = state;
      if (state.ok) setBaseline(s);
    }
  }, [state, s]);

  // Warn before leaving with unsaved changes (Shopify's "leave page?" guard).
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const update = (patch: Partial<EditorState>) => setS((prev) => ({ ...prev, ...patch }));
  const hasOptions = s.options.length > 0;
  const single = s.variants[0];

  function setTitle(name: string) {
    setS((prev) => ({ ...prev, name, handle: prev.handleTouched ? prev.handle : slugify(name) }));
  }

  function updateVariant(index: number, patch: Partial<VariantRow>) {
    setS((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));
  }

  function setOptions(options: OptionRow[]) {
    setS((prev) => {
      const variants =
        options.some((o) => o.values.length > 0)
          ? regenerateVariants(options, prev.variants)
          : [
              {
                ...(prev.variants.find((v) => v.id) ?? prev.variants[0]),
                options: [],
              },
            ];
      return { ...prev, options, variants };
    });
  }

  function addOptionValue(optionIndex: number) {
    const option = s.options[optionIndex];
    const parts = option.draft
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v && !option.values.some((existing) => existing.toLowerCase() === v.toLowerCase()));
    if (parts.length === 0) {
      setS((prev) => ({
        ...prev,
        options: prev.options.map((o, i) => (i === optionIndex ? { ...o, draft: "" } : o)),
      }));
      return;
    }
    setOptions(
      s.options.map((o, i) => (i === optionIndex ? { ...o, values: [...o.values, ...parts], draft: "" } : o)),
    );
  }

  function moveMedia(index: number, delta: number) {
    setS((prev) => {
      const media = [...prev.media];
      const target = index + delta;
      if (target < 0 || target >= media.length) return prev;
      [media[index], media[target]] = [media[target], media[index]];
      return { ...prev, media };
    });
  }

  function addImage() {
    const url = newImageUrl.trim();
    if (!url) {
      setMediaMessage("Paste an image link first, or choose a file from your device.");
      return;
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error();
    } catch {
      setMediaMessage("Enter a complete image link beginning with https:// or http://.");
      return;
    }
    update({ media: [...s.media, { key: newKey(), url, alt: "" }] });
    setNewImageUrl("");
    setMediaMessage("");
  }

  async function addImageFile(file?: File) {
    if (!file) return;
    setMediaMessage("");
    if (!file.type.startsWith("image/")) {
      setMediaMessage("Choose a JPG, PNG, WebP, GIF, or other image file.");
      return;
    }
    if (file.size > MAX_SOURCE_IMAGE_BYTES) {
      setMediaMessage("That image is larger than 8 MB. Choose a smaller file.");
      return;
    }

    setProcessingImage(true);
    try {
      const dataUrl = await resizeImage(file);
      const savedBytes = Math.ceil((dataUrl.length * 3) / 4);
      if (savedBytes > MAX_SAVED_IMAGE_BYTES) {
        setMediaMessage("The optimized image is still too large. Try a smaller photo.");
        return;
      }
      const blob = await (await fetch(dataUrl)).blob();
      const form = new FormData();
      form.set("file", blob, "product-image.webp");
      const response = await fetch("/api/admin/media", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The image could not be uploaded. Try again.");
      setS((prev) => ({
        ...prev,
        media: [...prev.media, { key: newKey(), url: result.url, alt: file.name.replace(/\.[^.]+$/, "") }],
      }));
    } catch (error) {
      setMediaMessage(error instanceof Error ? error.message : "This image could not be uploaded. Try again.");
    } finally {
      setProcessingImage(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function discard() {
    setS(baseline);
    setEditorKey((k) => k + 1);
  }

  return (
    <form action={formAction} className="board-editor">
      <input type="hidden" name="payload" value={payload} />

      {(dirty || pending) && (
        <div className="board-savebar" role="region" aria-label="Unsaved changes">
          <span>Unsaved changes</span>
          <div className="board-savebar-actions">
            <button type="button" className="board-button" onClick={discard} disabled={pending}>
              Discard
            </button>
            <button type="submit" className="board-button board-button-primary" disabled={pending || processingImage}>
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      {state?.error && (
        <p className="board-banner board-banner-critical" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && !dirty && (
        <p className="board-banner board-banner-success" role="status">
          {state.ok}
        </p>
      )}

      <div className="board-editor-grid">
        <div className="board-editor-main">
          <section className="board-card">
            <label className="board-field">
              Title
              <input
                className="board-input"
                value={s.name}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short sleeve jute tote"
                required
              />
            </label>
            <div className="board-field">
              <span id="description-label">Description</span>
              <RichTextEditor
                key={editorKey}
                initialHtml={s.descriptionHtml}
                label="Description"
                onChange={(html) => update({ descriptionHtml: html })}
              />
            </div>
          </section>

          <section className="board-card">
            <div className="board-card-header">
              <h2 className="board-card-title">Media</h2>
              <span className="board-hint">First image is the cover</span>
            </div>
            {s.media.length > 0 && (
              <ul className="board-media-list">
                {s.media.map((m, i) => (
                  <li key={m.key}>
                    {imageFailures.has(m.key) ? (
                      <div className="board-media-broken" role="img" aria-label="Image could not be loaded">
                        <span>Image unavailable</span>
                      </div>
                    ) : (
                      <img
                        src={m.url}
                        alt={m.alt || "Product image"}
                        onError={() => setImageFailures((old) => new Set(old).add(m.key))}
                      />
                    )}
                    <div className="board-media-fields">
                      {i === 0 && <span className="board-badge board-badge-info">Cover</span>}
                      <input
                        className="board-input"
                        value={m.alt}
                        placeholder="Alt text (describe the photo)"
                        aria-label={`Alt text for image ${i + 1}`}
                        onChange={(e) =>
                          update({ media: s.media.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)) })
                        }
                      />
                      <span className="board-media-url" title={m.url.startsWith("data:") ? "Uploaded from device" : m.url}>
                        {m.url.startsWith("data:") ? "Uploaded from device" : m.url}
                      </span>
                    </div>
                    <div className="board-media-actions">
                      <button type="button" className="board-icon-button" aria-label="Move up" disabled={i === 0} onClick={() => moveMedia(i, -1)}>
                        ↑
                      </button>
                      <button
                        type="button"
                        className="board-icon-button"
                        aria-label="Move down"
                        disabled={i === s.media.length - 1}
                        onClick={() => moveMedia(i, 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="board-icon-button danger"
                        aria-label="Remove image"
                        onClick={() => update({ media: s.media.filter((_, j) => j !== i) })}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="board-media-add">
              <input
                ref={fileInput}
                className="sr-only"
                type="file"
                accept="image/*"
                aria-label="Choose product image"
                onChange={(event) => void addImageFile(event.target.files?.[0])}
              />
              <button
                type="button"
                className="board-upload-button"
                onClick={() => fileInput.current?.click()}
                disabled={processingImage}
              >
                <span className="board-upload-icon" aria-hidden="true">＋</span>
                <span><strong>{processingImage ? "Uploading image…" : "Add image"}</strong><small>Choose a file from your device · up to 8 MB</small></span>
              </button>
              <div className="board-media-divider"><span>or add from a link</span></div>
              <div className="board-inline">
              <input
                className="board-input"
                type="url"
                value={newImageUrl}
                placeholder="Paste an image URL (https://…)"
                aria-label="Image URL"
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
              />
              <button type="button" className="board-button" onClick={addImage}>
                Add link
              </button>
              </div>
            </div>
            {mediaMessage && <p className="board-field-error" role="alert">{mediaMessage}</p>}
            <p className="board-hint">Use the arrow buttons to set the cover image. Photos are optimized and uploaded before saving.</p>
          </section>

          {!hasOptions && single && (
            <>
              <section className="board-card">
                <h2 className="board-card-title">Pricing</h2>
                <div className="board-form-row">
                  <label className="board-field">
                    Price (USD)
                    <input
                      className="board-input"
                      inputMode="numeric"
                      value={single.price}
                      onChange={(e) => updateVariant(0, { price: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </label>
                  <label className="board-field">
                    Compare-at price (USD)
                    <input
                      className="board-input"
                      inputMode="numeric"
                      value={single.compareAtPrice}
                      onChange={(e) => updateVariant(0, { compareAtPrice: e.target.value })}
                      placeholder="Optional — shows as a sale"
                    />
                  </label>
                </div>
              </section>
              <section className="board-card">
                <h2 className="board-card-title">Inventory</h2>
                <InventoryToggles s={s} update={update} />
                <div className="board-form-row">
                  <label className="board-field">
                    SKU
                    <input className="board-input" value={single.sku} onChange={(e) => updateVariant(0, { sku: e.target.value })} />
                  </label>
                  {s.trackInventory && (
                    <label className="board-field">
                      Quantity in stock
                      <input
                        className="board-input"
                        inputMode="numeric"
                        value={single.stock}
                        onChange={(e) => updateVariant(0, { stock: e.target.value })}
                      />
                    </label>
                  )}
                </div>
              </section>
            </>
          )}

          <section className="board-card">
            <h2 className="board-card-title">Variants</h2>
            {s.options.map((option, oi) => (
              <div className="board-option" key={option.key}>
                <div className="board-form-row">
                  <label className="board-field">
                    Option name
                    <input
                      className="board-input"
                      value={option.name}
                      placeholder={oi === 0 ? "Size" : oi === 1 ? "Color" : "Material"}
                      onChange={(e) =>
                        setOptions(s.options.map((o, i) => (i === oi ? { ...o, name: e.target.value } : o)))
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="board-link-button danger board-option-remove"
                    onClick={() => setOptions(s.options.filter((_, i) => i !== oi))}
                  >
                    Remove option
                  </button>
                </div>
                <div className="board-chips">
                  {option.values.map((value) => (
                    <span className="board-chip" key={value}>
                      {value}
                      <button
                        type="button"
                        aria-label={`Remove ${value}`}
                        onClick={() =>
                          setOptions(
                            s.options.map((o, i) => (i === oi ? { ...o, values: o.values.filter((v) => v !== value) } : o)),
                          )
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="board-inline">
                  <input
                    className="board-input"
                    value={option.draft}
                    placeholder="Add values, e.g. Small, Medium, Large"
                    aria-label={`Add values for ${option.name || "option"}`}
                    onChange={(e) =>
                      setS((prev) => ({
                        ...prev,
                        options: prev.options.map((o, i) => (i === oi ? { ...o, draft: e.target.value } : o)),
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOptionValue(oi);
                      }
                    }}
                  />
                  <button type="button" className="board-button" onClick={() => addOptionValue(oi)}>
                    Add
                  </button>
                </div>
              </div>
            ))}
            {s.options.length < 3 && (
              <button
                type="button"
                className="board-button"
                onClick={() => setOptions([...s.options, { key: newKey(), name: "", values: [], draft: "" }])}
              >
                + Add {hasOptions ? "another option" : "options like size or color"}
              </button>
            )}

            {hasOptions && s.variants.length > 0 && s.variants[0].options.length > 0 && (
              <>
                <InventoryToggles s={s} update={update} />
                <div className="board-table-wrap board-variant-table">
                  <table className="board-table">
                    <thead>
                      <tr>
                        <th>Variant</th>
                        <th>Price (USD)</th>
                        <th>Compare-at (USD)</th>
                        <th>SKU</th>
                        {s.trackInventory && <th>Stock</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {s.variants.map((v, vi) => (
                        <tr key={v.options.join("/")}>
                          <td className="board-cell-strong">{v.options.join(" / ")}</td>
                          <td>
                            <input
                              className="board-input board-input-sm"
                              inputMode="numeric"
                              aria-label={`Price for ${v.options.join(" / ")}`}
                              value={v.price}
                              onChange={(e) => updateVariant(vi, { price: e.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              className="board-input board-input-sm"
                              inputMode="numeric"
                              aria-label={`Compare-at price for ${v.options.join(" / ")}`}
                              value={v.compareAtPrice}
                              onChange={(e) => updateVariant(vi, { compareAtPrice: e.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              className="board-input board-input-sm"
                              aria-label={`SKU for ${v.options.join(" / ")}`}
                              value={v.sku}
                              onChange={(e) => updateVariant(vi, { sku: e.target.value })}
                            />
                          </td>
                          {s.trackInventory && (
                            <td>
                              <input
                                className="board-input board-input-sm"
                                inputMode="numeric"
                                aria-label={`Stock for ${v.options.join(" / ")}`}
                                value={v.stock}
                                onChange={(e) => updateVariant(vi, { stock: e.target.value })}
                              />
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          <section className="board-card">
            <h2 className="board-card-title">Search engine listing</h2>
            <label className="board-field">
              URL handle
              <div className="board-prefixed">
                <span>/shop/</span>
                <input
                  className="board-input"
                  value={s.handle}
                  onChange={(e) => update({ handle: e.target.value, handleTouched: true })}
                  onBlur={() => update({ handle: slugify(s.handle) })}
                />
              </div>
            </label>
            <p className="board-hint">
              Changing the handle of a live product breaks links people have already shared.
            </p>
          </section>
        </div>

        <aside className="board-editor-side">
          <section className="board-card">
            <label className="board-field">
              Status
              <select
                className="board-input"
                value={s.status}
                onChange={(e) => update({ status: e.target.value as ProductStatus })}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <p className="board-hint">
              {s.status === "active"
                ? "Visible in the shop."
                : s.status === "draft"
                  ? "Hidden from the shop until you set it Active."
                  : "Hidden and out of the way; set Active to bring it back."}
            </p>
            {product && s.status === "active" && (
              <Link href={`/shop/${product.slug}`} className="board-link-button" target="_blank">
                View in shop ↗
              </Link>
            )}
          </section>

          <section className="board-card">
            <h2 className="board-card-title">Collections</h2>
            {collections.length === 0 ? (
              <p className="board-hint">
                No collections yet. <Link href="/noksaboard/collections/new">Create one</Link>.
              </p>
            ) : (
              <div className="board-checklist">
                {collections.map((c) => (
                  <label key={c.id} className="board-check">
                    <input
                      type="checkbox"
                      checked={s.collectionIds.includes(c.id)}
                      onChange={(e) =>
                        update({
                          collectionIds: e.target.checked
                            ? [...s.collectionIds, c.id]
                            : s.collectionIds.filter((id) => id !== c.id),
                        })
                      }
                    />
                    {c.title}
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="board-card">
            <h2 className="board-card-title">Details</h2>
            <label className="board-field">
              Dimensions
              <input
                className="board-input"
                value={s.dimensions}
                placeholder="38 x 34 x 12 cm"
                onChange={(e) => update({ dimensions: e.target.value })}
              />
            </label>
            <p className="board-hint">Placeholder illustration (used when there are no images):</p>
            <div className="board-form-row">
              <label className="board-field">
                Shape
                <select
                  className="board-input"
                  value={s.shape}
                  onChange={(e) => update({ shape: e.target.value as ProductShape })}
                >
                  <option value="tote">Tote</option>
                  <option value="basket">Basket</option>
                  <option value="pouch">Pouch</option>
                  <option value="round">Round</option>
                </select>
              </label>
              <div className="board-field">
                <span>Illustration color</span>
                <div className="board-color-control">
                  <input
                    type="color"
                    className="board-color"
                    value={HEX_COLOR.test(s.color) ? s.color : "#bba078"}
                    aria-label="Choose illustration color"
                    onChange={(e) => update({ color: e.target.value })}
                  />
                  <input
                    className={`board-input board-color-code${HEX_COLOR.test(s.color) ? "" : " is-invalid"}`}
                    value={s.color}
                    aria-label="Illustration color hex code"
                    placeholder="#bba078"
                    maxLength={7}
                    spellCheck={false}
                    onChange={(e) => update({ color: e.target.value })}
                    onBlur={() => {
                      const value = s.color.trim();
                      update({ color: HEX_COLOR.test(value) ? value.toLowerCase() : "#bba078" });
                    }}
                  />
                </div>
                <div className="board-color-swatches" aria-label="Suggested colors">
                  {COLOR_SWATCHES.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={s.color.toLowerCase() === color.value ? "is-selected" : undefined}
                      style={{ backgroundColor: color.value }}
                      aria-label={color.name}
                      aria-pressed={s.color.toLowerCase() === color.value}
                      title={`${color.name} (${color.value})`}
                      onClick={() => update({ color: color.value })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {!dirty && !pending && (
        <div className="board-editor-footer">
          <button type="submit" className="board-button board-button-primary" disabled={processingImage}>
            {product ? "Save" : "Save product"}
          </button>
        </div>
      )}
    </form>
  );
}

function InventoryToggles({
  s,
  update,
}: {
  s: EditorState;
  update: (patch: Partial<EditorState>) => void;
}) {
  return (
    <div className="board-checklist">
      <label className="board-check">
        <input
          type="checkbox"
          checked={s.trackInventory}
          onChange={(e) => update({ trackInventory: e.target.checked })}
        />
        Track quantity
      </label>
      {s.trackInventory && (
        <label className="board-check">
          <input
            type="checkbox"
            checked={s.continueSelling}
            onChange={(e) => update({ continueSelling: e.target.checked })}
          />
          Continue selling when out of stock (made to order)
        </label>
      )}
    </div>
  );
}
