"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteCollection, saveCollection } from "@/lib/products-server";
import { slugify } from "@/lib/products";
import { requireAdmin } from "@/lib/require-admin";
import type { ActionResult } from "../action-form";

export async function saveCollectionAction(
  existingId: string | null,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  const handle = slugify(String(formData.get("handle") ?? "") || title);
  const description = String(formData.get("description") ?? "").trim().slice(0, 2000);
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;

  if (!title) return { error: "Title is required." };
  if (!handle) return { error: "URL handle must contain letters or numbers." };
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) return { error: "Image URL must start with https://" };

  let id: string;
  try {
    await requireAdmin();
    id = await saveCollection({ title, handle, description, imageUrl }, existingId ?? undefined);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't save the collection." };
  }
  revalidatePath("/noksaboard", "layout");
  revalidatePath("/", "layout");
  if (!existingId) redirect(`/noksaboard/collections/${id}`);
  return { ok: "Collection saved." };
}

export async function deleteCollectionAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteCollection(id);
  revalidatePath("/noksaboard", "layout");
  revalidatePath("/", "layout");
  redirect("/noksaboard/collections");
}
