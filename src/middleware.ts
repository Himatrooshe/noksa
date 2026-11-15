import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-session";

const BOARD_ROOT = "/noksaboard";
const LOGIN_PATH = "/noksaboard/login";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isBoardRoute = path.startsWith(BOARD_ROOT);
  const isLoginRoute = path === LOGIN_PATH;
  if (!isBoardRoute || isLoginRoute) return NextResponse.next();

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidSessionToken(token))) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // `${BOARD_ROOT}/:path*` alone does NOT match the bare BOARD_ROOT path
  // (no trailing segment) — both entries are required, or the dashboard
  // root is served with no auth check at all.
  matcher: ["/noksaboard", "/noksaboard/:path*"],
};
