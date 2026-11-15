"use server";
import { revalidatePath } from "next/cache";
import { updateCustomer } from "@/lib/orders-server";
import { isUuid } from "@/lib/products-server";
import { normalizePhone } from "@/lib/orders";
import { requireAdmin } from "@/lib/require-admin";
import type { ActionResult } from "../action-form";

export async function updateCustomerAction(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const get = (name: string, max = 500) => String(formData.get(name) ?? "").trim().slice(0, max);
  const name = get("name", 200);
  const phone = normalizePhone(get("phone", 30));
  const email = get("email", 200) || null;
  if (!isUuid(id)) return { error: "Customer not found." };
  if (!name) return { error: "Name is required." };
  if (!phone) return { error: "Enter a valid phone number." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "That email address doesn't look right." };
  try {
    await requireAdmin();
    await updateCustomer(id, {
      name,
      phone,
      email,
      address: get("address") || null,
      city: get("city", 100) || null,
      note: get("note", 2000),
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't save." };
  }
  revalidatePath("/noksaboard", "layout");
  return { ok: "Customer saved." };
}
