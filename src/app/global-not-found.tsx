import Link from "next/link";
import type { Metadata } from "next";
import "./globals.css";

// Required because the app has multiple independent root layouts (see
// src/app/(storefront)/layout.tsx and src/app/noksaboard/layout.tsx) —
// there's no single layout to compose a normal root `not-found.tsx` from,
// so Next.js needs this file instead (gated by `experimental.globalNotFound`
// in next.config.ts). It bypasses normal rendering entirely, so it supplies
// its own full <html>/<body> and imports its own styles.
export const metadata: Metadata = {
  title: "Page not found",
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main id="main-content" className="container not-found">
          <p className="eyebrow">Page not found</p>
          <h1>Let’s find your way back.</h1>
          <p>The page or product you’re looking for isn’t here.</p>
          <Link href="/shop" className="button">
            Explore the collection
          </Link>
        </main>
      </body>
    </html>
  );
}
