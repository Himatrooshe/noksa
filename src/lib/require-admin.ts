import "server-only";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-session";

/**
 * Call at the top of every dashboard Server Action.
 *
 * middleware.ts only gates *pages* under /noksaboard. Server Actions are
 * POST endpoints addressed by an action ID, and Next.js will run one when
 * it's posted to any route (including the public storefront, which
 * middleware doesn't cover). So each mutation re-checks the session itself.
 */
export async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  if (!(await isValidSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value))) {
    throw new Error("Your session has expired. Log in again.");
  }
}
