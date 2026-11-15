"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteProducts,
  isUuid,
  saveProduct,
  setProductsStatus,
  type ProductInput,
  type VariantInput,
} from "@/lib/products-server";
import { slugify, type ProductShape, type ProductStatus } from "@/lib/products";
import { requireAdmin } from "@/lib/require-admin";
import type { ActionResult } from "../action-form";

/** Shape the product editor posts (as JSON in the `payload` field). */
export type ProductPayload = {
  name: string;
  handle: string;
  status: ProductStatus;
  descriptionHtml: string;
  dimensions: string;
  color: string;
  shape: ProductShape;
  trackInventory: boolean;
  continueSelling: boolean;
  media: { url: string; alt: string }[];
  options: { name: string; values: string[] }[];
  variants: {
    id: string | null;
    options: string[];
    price: string;
    compareAtPrice: string;
    sku: string;
    stock: string;
  }[];
  collectionIds: string[];
};

const STATUSES: ProductStatus[] = ["active", "draft", "archived"];
const SHAPES: ProductShape[] = ["tote", "basket", "pouch", "round"];
const MAX_VARIANTS = 250;
const MAX_MEDIA = 50;

function money(raw: string, label: string): number {
  const value = raw.trim();
  if (!/^\d+$/.test(value)) throw new Error(`${label} must be a whole number of US dollars (e.g. 29).`);
  return Number(value);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function toInput(p: ProductPayload): ProductInput {
  const name = p.name?.trim() ?? "";
  if (!name) throw new Error("Title is required.");
  if (name.length > 255) throw new Error("Title must be 255 characters or fewer.");
  const slug = slugify(p.handle || name);
  if (!slug) throw new Error("URL handle must contain letters or numbers.");
  if (!STATUSES.includes(p.status)) throw new Error("Invalid status.");
  if (!SHAPES.includes(p.shape)) throw new Error("Invalid illustration shape.");
  if (!/^#[0-9a-f]{6}$/i.test(p.color)) throw new Error("Invalid illustration color.");
  if ((p.descriptionHtml ?? "").length > 64_000) throw new Error("Description is too long.");

  // Options
  if (p.options.length > 3) throw new Error("A product can have at most 3 options.");
  const options = p.options.map((o) => ({
    name: o.name.trim(),
    values: o.values.map((v) => v.trim()).filter(Boolean),
  }));
  const names = new Set<string>();
  for (const o of options) {
    if (!o.name) throw new Error("Every option needs a name (e.g. Size).");
    if (names.has(o.name.toLowerCase())) throw new Error(`Option "${o.name}" is listed twice.`);
    names.add(o.name.toLowerCase());
    if (o.values.length === 0) throw new Error(`Add at least one value for "${o.name}".`);
    if (new Set(o.values.map((v) => v.toLowerCase())).size !== o.values.length) {
      throw new Error(`"${o.name}" has a duplicate value.`);
    }
  }

  // Variants
  if (p.variants.length === 0) throw new Error("A product needs at least one variant.");
  if (p.variants.length > MAX_VARIANTS) throw new Error(`At most ${MAX_VARIANTS} variants.`);
  if (options.length === 0 && p.variants.length !== 1) throw new Error("Unexpected extra variants.");
  const combos = new Set<string>();
  const variants: VariantInput[] = p.variants.map((v) => {
    const label = v.options.length ? v.options.join(" / ") : "Price";
    if (v.options.length !== options.length) throw new Error("Variant options don't match the product options.");
    v.options.forEach((value, i) => {
      if (!options[i].values.includes(value)) throw new Error(`"${value}" isn't a value of ${options[i].name}.`);
    });
    const key = v.options.join("\u0000").toLowerCase();
    if (combos.has(key)) throw new Error(`Variant "${label}" is listed twice.`);
    combos.add(key);

    const price = money(v.price, options.length ? `Price for ${label}` : "Price");
    const compareAtPrice = v.compareAtPrice.trim() ? money(v.compareAtPrice, "Compare-at price") : null;
    if (compareAtPrice !== null && compareAtPrice <= price) {
      throw new Error(`Compare-at price must be higher than the price${options.length ? ` (${label})` : ""}.`);
    }
    const stockText = v.stock.trim() || "0";
    if (!/^-?\d+$/.test(stockText)) throw new Error(`Stock must be a whole number${options.length ? ` (${label})` : ""}.`);
    const stock = Number(stockText);
    if (stock < 0 && !(p.trackInventory && p.continueSelling)) {
      throw new Error(`Stock can't be negative${options.length ? ` (${label})` : ""}.`);
    }
    const sku = v.sku.trim() || null;
    if (sku && sku.length > 100) throw new Error("SKU must be 100 characters or fewer.");
    if (v.id !== null && !isUuid(v.id)) throw new Error("Invalid variant.");
    return { id: v.id, options: v.options, price, compareAtPrice, sku, stock };
  });

  // Media
  if (p.media.length > MAX_MEDIA) throw new Error(`At most ${MAX_MEDIA} images.`);
  const media = p.media.map((m) => {
    const url = m.url.trim();
    if (!isHttpUrl(url)) {
      throw new Error("An image is invalid. Upload it again or use a complete http(s) link.");
    }
    return { url, alt: m.alt.trim().slice(0, 512) };
  });

  if (!p.collectionIds.every(isUuid)) throw new Error("Invalid collection.");

  return {
    name,
    slug,
    status: p.status,
    descriptionHtml: p.descriptionHtml ?? "",
    dimensions: p.dimensions.trim().slice(0, 200),
    color: p.color,
    shape: p.shape,
    trackInventory: Boolean(p.trackInventory),
    continueSelling: Boolean(p.continueSelling),
    media,
    options,
    variants,
    collectionIds: [...new Set(p.collectionIds)],
  };
}

function revalidateCatalog() {
  revalidatePath("/noksaboard", "layout");
  revalidatePath("/", "layout");
}

export async function saveProductAction(
  existingId: string | null,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let id: string;
  try {
    await requireAdmin();
    const payload = JSON.parse(String(formData.get("payload") ?? "")) as ProductPayload;
    id = await saveProduct(toInput(payload), existingId ?? undefined);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't save the product." };
  }
  revalidateCatalog();
  if (!existingId) redirect(`/noksaboard/products/${id}?created=1`);
  return { ok: "Product saved." };
}

export async function deleteProductAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteProducts([id]);
  revalidateCatalog();
  redirect("/noksaboard/products");
}

export async function bulkProductsAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ids = formData.getAll("ids").map(String).filter(isUuid);
  const op = String(formData.get("op") ?? "");
  if (ids.length === 0) return { error: "Select at least one product." };
  try {
    await requireAdmin();
    if (op === "delete") await deleteProducts(ids);
    else if (STATUSES.includes(op as ProductStatus)) await setProductsStatus(ids, op as ProductStatus);
    else return { error: "Unknown action." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Bulk action failed." };
  }
  revalidateCatalog();
  const verb = op === "delete" ? "Deleted" : `Set to ${op}:`;
  return { ok: `${verb} ${ids.length} product${ids.length === 1 ? "" : "s"}.` };
}
