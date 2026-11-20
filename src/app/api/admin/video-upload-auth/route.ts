import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-session";
import { videoUploadAuth } from "@/lib/imagekit";

export const runtime = "nodejs";

/** Signs one direct-to-ImageKit video upload for an authenticated admin. */
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
  try {
    return NextResponse.json(videoUploadAuth(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Video uploads are not available.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
