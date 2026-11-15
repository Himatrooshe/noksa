import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-session";
import { logout } from "./login/actions";
import { BoardNav } from "./board-nav";
import "./board.css";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Noksa" },
  robots: { index: false, follow: false },
};

// This is one of two independent root layouts (the other is
// src/app/(storefront)/layout.tsx) — the dashboard is deliberately a
// separate app shell with its own <html>/<body>, not nested inside the
// storefront's header/footer/cart. See Next.js "multiple root layouts".
export default async function BoardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const signedIn = await isValidSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  // The login route renders its own standalone page (no sidebar). Everything
  // else under /noksaboard is already gated by middleware.ts; this is just
  // the UI shell for a confirmed session.
  if (!signedIn) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <div className="board-shell">
          <aside className="board-sidebar">
            <div className="board-brand">
              <span className="board-brand-mark">N</span>
              <span className="board-brand-text">
                Noksa
                <span className="board-brand-sub">Dashboard</span>
              </span>
            </div>
            <BoardNav />
            <div className="board-sidebar-footer">
              <Link href="/">View storefront</Link>
              <form action={logout}>
                <button type="submit">Log out</button>
              </form>
            </div>
          </aside>
          <main className="board-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
