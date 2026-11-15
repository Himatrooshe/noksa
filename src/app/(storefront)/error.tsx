"use client";

import { useEffect } from "react";
import { claimChunkReload } from "@/lib/chunk-recovery";

export default function StorefrontError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // A full reload fetches fresh route assets; resetting React alone can reuse
    // the rejected module promise. Keep this bounded across page reloads.
    try {
      if (claimChunkReload(error, window.sessionStorage, window.location.href)) {
        window.location.reload();
      }
    } catch {
      // Access to sessionStorage itself may be disabled by the browser.
    }
  }, [error]);

  return (
    <main id="main-content" className="container not-found" role="alert">
      <h1>This page couldn’t load</h1>
      <p>Please reload the page to try again.</p>
      <div className="storefront-error-actions">
        <button type="button" className="button" onClick={() => window.location.reload()}>
          Reload page
        </button>
        <a href="/shop" className="inline-link">Back to the shop</a>
      </div>
    </main>
  );
}
