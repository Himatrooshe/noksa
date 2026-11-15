import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import type { NextConfig } from "next";

export default function nextConfig(phase: string): NextConfig {
  return {
    // Builds and dev servers must never overwrite one another's route chunks.
    // Next sets PORT to the actual listening port, including automatic fallback.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? `.next-dev/${process.env.PORT ?? "3000"}` : ".next",
    experimental: {
      // Required for app/global-not-found.tsx: with two independent root
      // layouts ((storefront) and noksaboard, each with their own
      // <html>/<body>), there's no single layout to compose a normal
      // root-level not-found.tsx from.
      globalNotFound: true,
    },
  };
}
