// Client-safe blog types and helpers. Database access lives in blog-server.ts.

export type BlogStatus = "draft" | "published";

export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  status: BlogStatus;
  publishedAt: string | null;
  updatedAt: string;
  readingMinutes: number;
};

export type BlogPost = BlogPostSummary & { bodyHtml: string };

/** About 200 words a minute, at least one minute. */
export function readingMinutes(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatPostDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
