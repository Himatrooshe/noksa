import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-session";
import { sql } from "@/lib/db";
import { isUuid } from "@/lib/products-server";

export const dynamic = "force-dynamic";

/** Fetch one embedded image instead of streaming every image with the catalog. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return new Response(null, { status: 404 });

  const rows = await sql`
    select m.url, p.status from product_media m
    join products p on p.id = m.product_id where m.id = ${id}
  `;
  const media = rows[0];
  if (!media) return new Response(null, { status: 404 });
  if (media.status !== "active") {
    const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
    if (!(await isValidSessionToken(token))) return new Response(null, { status: 404 });
  }

  // Match the raster formats accepted by the product editor; never serve HTML
  // or SVG from this origin, or redirect to an arbitrary stored URL.
  const image = /^data:(image\/(?:avif|gif|jpeg|png|webp));base64,([a-z0-9+/]+={0,2})$/i.exec(media.url);
  if (!image) return new Response(null, { status: 404 });
  const bytes = Buffer.from(image[2], "base64");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": image[1].toLowerCase(),
      "Content-Length": String(bytes.length),
      // Check visibility again after dashboard changes, including archival.
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
