"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addOrderComment,
  cancelOrder,
  createOrder,
  findCustomerByPhone,
  fulfillOrder,
  markOrderDelivered,
  markOrderPaid,
  markOrderRefunded,
  setOrderArchived,
  updateOrderNote,
} from "@/lib/orders-server";
import { isUuid } from "@/lib/products-server";
import { normalizePhone, PAYMENT_METHODS, type PaymentMethod } from "@/lib/orders";
import { requireAdmin } from "@/lib/require-admin";
import type { ActionResult } from "../action-form";

function text(formData: FormData, name: string, max = 500): string {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}
function optional(formData: FormData, name: string, max = 500): string | null {
  return text(formData, name, max) || null;
}
function paymentMethod(value: string): PaymentMethod {
  const method = PAYMENT_METHODS.find((m) => m.value === value)?.value;
  if (!method) throw new Error("Choose a payment method.");
  return method;
}
function wholeDollars(raw: string, label: string): number {
  const value = raw.trim() || "0";
  if (!/^\d+$/.test(value)) throw new Error(`${label} must be a whole number of US dollars.`);
  return Number(value);
}

function revalidateOrders(id?: string) {
  revalidatePath("/noksaboard", "layout");
  if (id) revalidatePath(`/noksaboard/orders/${id}`);
  // Stock changes affect the storefront too.
  revalidatePath("/", "layout");
}

/** Wraps an order action: runs it, revalidates, and reports errors inline. */
async function run(id: string, fn: () => Promise<void>, ok: string): Promise<ActionResult> {
  if (!isUuid(id)) return { error: "Order not found." };
  try {
    await requireAdmin();
    await fn();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Something went wrong." };
  }
  revalidateOrders(id);
  return { ok };
}

// ---------------------------------------------------------------------------

export type NewOrderPayload = {
  customer: { name: string; phone: string; email: string; address: string; city: string };
  lines: { variantId: string; quantity: number }[];
  shippingFee: string;
  discount: string;
  paymentMethod: string;
  markPaid: boolean;
  transactionId: string;
  note: string;
};

export async function createOrderAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  let orderId: string;
  try {
    await requireAdmin();
    const p = JSON.parse(String(formData.get("payload") ?? "")) as NewOrderPayload;
    const name = p.customer.name.trim();
    const phone = normalizePhone(p.customer.phone);
    if (!name) throw new Error("Customer name is required.");
    if (!phone) throw new Error("Enter a valid phone number.");
    const email = p.customer.email.trim() || null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("That email address doesn't look right.");

    if (p.lines.length === 0) throw new Error("Add at least one product.");
    const lines = p.lines.map((l) => {
      if (!isUuid(l.variantId)) throw new Error("Invalid product in the order.");
      if (!Number.isInteger(l.quantity) || l.quantity < 1 || l.quantity > 999) {
        throw new Error("Quantities must be whole numbers from 1 to 999.");
      }
      return l;
    });
    // Merge duplicate lines for the same variant.
    const merged = new Map<string, number>();
    for (const l of lines) merged.set(l.variantId, (merged.get(l.variantId) ?? 0) + l.quantity);

    const method = paymentMethod(p.paymentMethod);
    const transactionId = p.transactionId.trim().slice(0, 100) || null;
    orderId = await createOrder({
      customer: {
        name: name.slice(0, 200),
        phone,
        email,
        address: p.customer.address.trim().slice(0, 500) || null,
        city: p.customer.city.trim().slice(0, 100) || null,
      },
      lines: [...merged].map(([variantId, quantity]) => ({ variantId, quantity })),
      shippingFee: wholeDollars(p.shippingFee, "Shipping"),
      discount: wholeDollars(p.discount, "Discount"),
      paymentMethod: method,
      markPaid: Boolean(p.markPaid),
      transactionId,
      note: p.note.trim().slice(0, 2000),
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't create the order." };
  }
  revalidateOrders();
  redirect(`/noksaboard/orders/${orderId}?created=1`);
}

/** Prefill the create-order form when a known phone number is typed. */
export async function lookupCustomerAction(rawPhone: string) {
  await requireAdmin();
  const phone = normalizePhone(rawPhone);
  if (!phone) return null;
  return findCustomerByPhone(phone);
}

export async function markPaidAction(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return run(
    id,
    () => markOrderPaid(id, paymentMethod(text(formData, "paymentMethod")), optional(formData, "transactionId", 100)),
    "Payment recorded.",
  );
}

export async function refundAction(id: string, _prev: ActionResult): Promise<ActionResult> {
  return run(id, () => markOrderRefunded(id), "Marked as refunded.");
}

export async function fulfillAction(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return run(
    id,
    () => fulfillOrder(id, optional(formData, "courier", 100), optional(formData, "trackingNumber", 100)),
    "Marked as shipped.",
  );
}

export async function deliveredAction(id: string, _prev: ActionResult): Promise<ActionResult> {
  return run(id, () => markOrderDelivered(id), "Marked as delivered.");
}

export async function cancelAction(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return run(id, () => cancelOrder(id, formData.get("restock") === "on"), "Order cancelled.");
}

export async function archiveAction(id: string, archived: boolean, _prev: ActionResult): Promise<ActionResult> {
  return run(id, () => setOrderArchived(id, archived), archived ? "Order archived." : "Order unarchived.");
}

export async function noteAction(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return run(id, () => updateOrderNote(id, text(formData, "note", 2000)), "Note saved.");
}

export async function commentAction(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const message = text(formData, "comment", 1000);
  if (!message) return { error: "Write a comment first." };
  return run(id, () => addOrderComment(id, message), "Comment added.");
}
