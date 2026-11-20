"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { isOwnVideoUrl } from "@/lib/imagekit";
import { createVideo, deleteVideo, setShowcasedVideo, updateVideoText } from "@/lib/videos-server";
import type { ActionResult } from "../action-form";

function readText(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  const caption = String(formData.get("caption") ?? "").trim().slice(0, 400);
  return { title, caption };
}

function refresh() {
  revalidatePath("/noksaboard/videos");
  revalidatePath("/");
}

/** Saves a video the browser has already uploaded to ImageKit. */
export async function saveUploadedVideoAction(input: {
  title: string;
  caption: string;
  url: string;
  fileId: string | null;
  showcase: boolean;
}): Promise<ActionResult> {
  const title = input.title.trim().slice(0, 120);
  const caption = input.caption.trim().slice(0, 400);
  if (!title) return { error: "Add a title for the video." };
  try {
    await requireAdmin();
    if (!isOwnVideoUrl(input.url)) return { error: "That video didn't come from this store's upload folder." };
    const fileId = typeof input.fileId === "string" ? input.fileId.slice(0, 200) : null;
    await createVideo({ title, caption, url: input.url, fileId }, Boolean(input.showcase));
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't save the video." };
  }
  refresh();
  return { ok: input.showcase ? "Video saved and showcased on the home page." : "Video saved." };
}

export async function updateVideoAction(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { title, caption } = readText(formData);
  if (!title) return { error: "Title is required." };
  try {
    await requireAdmin();
    await updateVideoText(id, title, caption);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't save the video." };
  }
  refresh();
  return { ok: "Saved." };
}

export async function showcaseVideoAction(id: string | null): Promise<void> {
  await requireAdmin();
  await setShowcasedVideo(id);
  refresh();
}

export async function deleteVideoAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteVideo(id);
  refresh();
}
