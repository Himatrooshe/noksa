import "server-only";
import { headers } from "next/headers";
import type { Metadata } from "next";

/** Prefer a fixed public origin; use the current request during local setup. */
export async function getSiteUrl(): Promise<URL> {
  const configured = process.env.SITE_URL?.trim();
  if (configured) {
    const url = new URL(configured);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
      throw new Error("SITE_URL must be an http(s) URL without credentials.");
    }
    return new URL(url.origin);
  }

  const requestHeaders = await headers();
  const host = (requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"))?.split(",")[0].trim();
  if (!host) throw new Error("Set SITE_URL to the public storefront URL.");
  const protocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0].trim() === "https" ? "https" : "http";
  return new URL(`${protocol}://${host}`);
}

export async function getPageMetadata(
  path: string,
  title?: string,
  description?: string,
): Promise<Metadata> {
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: new URL(path, await getSiteUrl()).href },
  };
}
