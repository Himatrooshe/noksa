import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { sql } from "@/lib/db";
import { isUuid } from "@/lib/products-server";
import { readingMinutes, type BlogPost, type BlogPostSummary, type BlogStatus } from "@/lib/blog";

const BLOG_TAG = "blog";

type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  body_html: string;
  status: BlogStatus;
  published_at: string | Date | null;
  updated_at: string | Date;
};

const iso = (value: string | Date | null) => (value ? new Date(value).toISOString() : null);

function toPost(row: PostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url,
    status: row.status,
    publishedAt: iso(row.published_at),
    updatedAt: iso(row.updated_at)!,
    bodyHtml: row.body_html,
    readingMinutes: readingMinutes(row.body_html),
  };
}

const summary = ({ bodyHtml: _body, ...post }: BlogPost): BlogPostSummary => post;

/** Postgres "undefined_table": migration 006 hasn't been applied yet. */
export const isMissingBlogTable = (err: unknown) => (err as { code?: unknown })?.code === "42P01";

/**
 * Blog bodies allow a little more than product descriptions: headings, quotes,
 * rules and images. Images must be HTTPS; links get rel=noopener.
 */
export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "h2", "h3", "h4", "ul", "ol", "li", "a", "blockquote", "hr", "img", "figure", "figcaption"],
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  }).trim();
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export async function getAllPosts(): Promise<BlogPostSummary[]> {
  const rows = (await sql`
    select * from blog_posts order by coalesce(published_at, updated_at) desc
  `) as unknown as PostRow[];
  return rows.map((row) => summary(toPost(row)));
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  if (!isUuid(id)) return null;
  const [row] = (await sql`select * from blog_posts where id = ${id}`) as unknown as PostRow[];
  return row ? toPost(row) : null;
}

export type PostInput = {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  bodyHtml: string;
  status: BlogStatus;
};

export async function savePost(input: PostInput, existingId?: string): Promise<string> {
  const body = sanitizeBlogHtml(input.bodyHtml);
  const id = existingId ?? crypto.randomUUID();
  try {
    if (existingId) {
      await sql`
        update blog_posts set
          title = ${input.title}, slug = ${input.slug}, excerpt = ${input.excerpt},
          cover_image_url = ${input.coverImageUrl}, body_html = ${body}, status = ${input.status},
          published_at = case when ${input.status} = 'published' then coalesce(published_at, now()) else published_at end,
          updated_at = now()
        where id = ${id}
      `;
    } else {
      await sql`
        insert into blog_posts (id, title, slug, excerpt, cover_image_url, body_html, status, published_at)
        values (${id}, ${input.title}, ${input.slug}, ${input.excerpt}, ${input.coverImageUrl}, ${body},
                ${input.status}, ${input.status === "published" ? new Date().toISOString() : null})
      `;
    }
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      throw new Error(`Another post already uses the URL “/blog/${input.slug}”. Choose a different one.`);
    }
    throw err;
  }
  revalidateTag(BLOG_TAG);
  return id;
}

export async function deletePost(id: string): Promise<void> {
  if (!isUuid(id)) return;
  await sql`delete from blog_posts where id = ${id}`;
  revalidateTag(BLOG_TAG);
}

// ---------------------------------------------------------------------------
// Storefront (cached; every write above clears the cache)
// ---------------------------------------------------------------------------

export const getPublishedPosts = unstable_cache(
  async (): Promise<BlogPostSummary[]> => {
    try {
      const rows = (await sql`
        select * from blog_posts where status = 'published' order by published_at desc
      `) as unknown as PostRow[];
      return rows.map((row) => summary(toPost(row)));
    } catch (err) {
      if (isMissingBlogTable(err)) return [];
      throw err;
    }
  },
  ["published-posts"],
  { revalidate: 300, tags: [BLOG_TAG] },
);

export const getPublishedPost = unstable_cache(
  async (slug: string): Promise<BlogPost | null> => {
    try {
      const [row] = (await sql`
        select * from blog_posts where slug = ${slug} and status = 'published'
      `) as unknown as PostRow[];
      return row ? toPost(row) : null;
    } catch (err) {
      if (isMissingBlogTable(err)) return null;
      throw err;
    }
  },
  ["published-post"],
  { revalidate: 300, tags: [BLOG_TAG] },
);
