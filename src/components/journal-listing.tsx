import Link from "next/link";
import { Icon } from "./icons";
import { formatPostDate, type BlogPostSummary } from "@/lib/blog";
import { imageUrl } from "@/lib/image-url";

export const BLOG_PAGE_SIZE = 8;

/** Filters (by title and excerpt) and pages the newest-first list of posts. */
export function paginateBlog(all: BlogPostSummary[], requestedPage: number, query: string) {
  const q = query.trim().toLowerCase();
  const matches = q ? all.filter((post) => `${post.title} ${post.excerpt}`.toLowerCase().includes(q)) : all;
  const totalPages = Math.max(1, Math.ceil(matches.length / BLOG_PAGE_SIZE));
  const page = Math.min(Math.max(1, Math.floor(requestedPage) || 1), totalPages);
  return {
    page,
    totalPages,
    total: matches.length,
    posts: matches.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE),
  };
}

const pageHref = (page: number, query: string) => {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/blog?${search}` : "/blog";
};

function Meta({ post }: { post: BlogPostSummary }) {
  return (
    <span className="journal-meta">
      <time dateTime={post.publishedAt ?? undefined}>{formatPostDate(post.publishedAt)}</time>
      <span aria-hidden="true">·</span>
      {post.readingMinutes} min read
    </span>
  );
}

function PostRow({ post }: { post: BlogPostSummary }) {
  return (
    <article className="blog-post">
      <Link href={`/blog/${post.slug}`} className="blog-post-image" tabIndex={-1} aria-hidden="true">
        {post.coverImageUrl ? (
          <img
            src={imageUrl(post.coverImageUrl, 720)}
            srcSet={[480, 720, 1080].map((w) => `${imageUrl(post.coverImageUrl!, w)} ${w}w`).join(", ")}
            sizes="(max-width: 700px) 100vw, 300px"
            alt=""
            loading="lazy"
          />
        ) : (
          <span className="blog-post-blank" lang="bn">
            নকশা
          </span>
        )}
      </Link>
      <div className="blog-post-text">
        <Meta post={post} />
        <h2>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        {post.excerpt && <p>{post.excerpt}</p>}
        <Link href={`/blog/${post.slug}`} className="blog-read-more" aria-label={`Read more: ${post.title}`}>
          Read more <Icon name="arrow" />
        </Link>
      </div>
    </article>
  );
}

/** A classic blog index: post list with pagination on the left, sidebar on the right. */
export function BlogIndex({
  posts,
  recent,
  page,
  totalPages,
  total,
  query,
}: {
  posts: BlogPostSummary[];
  recent: BlogPostSummary[];
  page: number;
  totalPages: number;
  total: number;
  query: string;
}) {
  return (
    <div className="blog-layout">
      <div className="blog-main">
        {query && (
          <p className="blog-search-status" role="status">
            {total === 0 ? "No posts match" : `${total} ${total === 1 ? "post matches" : "posts match"}`} “{query}”.{" "}
            <Link href="/blog">Clear search</Link>
          </p>
        )}

        {posts.length > 0 ? (
          <div className="blog-list">
            {posts.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
          </div>
        ) : (
          !query && (
            <div className="blog-empty">
              <h2>No posts yet.</h2>
              <p>Our first stories are being written. Check back soon.</p>
            </div>
          )
        )}

        {totalPages > 1 && (
          <nav className="blog-pages" aria-label="Blog pages">
            {page > 1 ? (
              <Link href={pageHref(page - 1, query)} rel="prev" className="blog-page-step">
                <span aria-hidden="true">←</span> Newer posts
              </Link>
            ) : (
              <span />
            )}
            <ol>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <li key={n}>
                  <Link href={pageHref(n, query)} aria-current={n === page ? "page" : undefined} aria-label={`Page ${n}`}>
                    {n}
                  </Link>
                </li>
              ))}
            </ol>
            {page < totalPages ? (
              <Link href={pageHref(page + 1, query)} rel="next" className="blog-page-step">
                Older posts <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>

      <aside className="blog-sidebar" aria-label="Blog sidebar">
        <form className="blog-widget blog-search" action="/blog" role="search">
          <label htmlFor="blog-search-input">Search the blog</label>
          <div>
            <input id="blog-search-input" name="q" type="search" defaultValue={query} placeholder="Jute, totes, artisans…" />
            <button type="submit" aria-label="Search">
              <Icon name="arrow" />
            </button>
          </div>
        </form>

        <section className="blog-widget">
          <h2>About this blog</h2>
          <p>Stories about Bangladeshi jute, the artisans who shape it, and how we design bags for everyday life.</p>
          <Link href="/about" className="blog-widget-link">
            Our story <Icon name="arrow" />
          </Link>
        </section>

        {recent.length > 0 && (
          <section className="blog-widget">
            <h2>Recent posts</h2>
            <ul className="blog-recent">
              {recent.map((post) => (
                <li key={post.id}>
                  <Link href={`/blog/${post.slug}`}>
                    <span className="blog-recent-thumb">
                      {post.coverImageUrl ? (
                        <img src={imageUrl(post.coverImageUrl, 160)} alt="" loading="lazy" />
                      ) : (
                        <span lang="bn">নকশা</span>
                      )}
                    </span>
                    <span>
                      <span className="blog-recent-title">{post.title}</span>
                      <time dateTime={post.publishedAt ?? undefined}>{formatPostDate(post.publishedAt)}</time>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Link href="/shop" className="blog-widget blog-shop">
          <span className="blog-shop-label">Handmade in Bangladesh</span>
          <span className="blog-shop-title">Shop the collection</span>
          <span className="blog-widget-link">
            Browse bags <Icon name="arrow" />
          </span>
        </Link>
      </aside>
    </div>
  );
}
