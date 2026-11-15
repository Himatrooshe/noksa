import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-session";
import { uploadImage, MAX_IMAGE_BYTES } from "@/lib/imagekit";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 2_000_000;

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  if (!(await isValidSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: "Your session has expired. Log in again." }, { status: 401 });
  }
  const origin = request.headers.get("origin");
  let sameOrigin = false;
  try { sameOrigin = Boolean(origin && new URL(origin).host === request.headers.get("host")); } catch { /* reject malformed origins */ }
  if (!sameOrigin) {
    return NextResponse.json({ error: "Upload must come from this site." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) {
    return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  }
  // Bound the stream as well as Content-Length, which clients can omit.
  const reader = request.body?.getReader();
  if (!reader) return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return NextResponse.json({ error: "That image is too large. Choose a smaller image." }, { status: 413 });
    }
    chunks.push(value);
  }
  try {
    const form = await new Response(Buffer.concat(chunks), { headers: { "content-type": request.headers.get("content-type")! } }).formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Choose an image smaller than 1.5 MB after optimization." }, { status: 400 });
    }
    const image = await uploadImage(Buffer.from(await file.arrayBuffer()));
    return NextResponse.json(image, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The image could not be uploaded. Try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
