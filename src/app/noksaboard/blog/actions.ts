"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deletePost, savePost } from "@/lib/blog-server";
import type { BlogStatus } from "@/lib/blog";
import { slugify } from "@/lib/products";
import { requireAdmin } from "@/lib/require-admin";
import type { ActionResult } from "../action-form";

export type PostPayload = {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  bodyHtml: string;
  status: BlogStatus;
};

function refresh(slug?: string) {
  revalidatePath("/noksaboard/blog");
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function savePostAction(
  existingId: string | null,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let id: string;
  let slug: string;
  let status: BlogStatus;
  try {
    await requireAdmin();
    const p = JSON.parse(String(formData.get("payload") ?? "")) as PostPayload;
    const title = String(p.title ?? "").trim().slice(0, 160);
    slug = slugify(String(p.slug ?? "") || title).slice(0, 90).replace(/-+$/, "");
    status = p.status === "published" ? "published" : "draft";
    const cover = String(p.coverImageUrl ?? "").trim();
    if (!title) return { error: "Give the post a title." };
    if (!slug) return { error: "The URL must contain letters or numbers." };
    if (cover && !cover.startsWith("https://")) return { error: "The cover image must be an https:// URL." };
    if (status === "published" && !String(p.bodyHtml ?? "").replace(/<[^>]+>/g, "").trim()) {
      return { error: "Write something before publishing." };
    }
    id = await savePost(
      {
        title,
        slug,
        excerpt: String(p.excerpt ?? "").trim().slice(0, 400),
        coverImageUrl: cover || null,
        bodyHtml: String(p.bodyHtml ?? "").slice(0, 200_000),
        status,
      },
      existingId ?? undefined,
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't save the post." };
  }
  refresh(slug);
  if (!existingId) redirect(`/noksaboard/blog/${id}?created=1`);
  return { ok: status === "published" ? "Saved and published." : "Draft saved." };
}

export async function deletePostAction(id: string): Promise<void> {
  await requireAdmin();
  await deletePost(id);
  refresh();
  redirect("/noksaboard/blog");
}
