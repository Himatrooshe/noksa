import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { formatPostDate } from "@/lib/blog";
import { getPublishedPost, getPublishedPosts } from "@/lib/blog-server";
import { imageUrl } from "@/lib/image-url";
import { getPageMetadata } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Story not found" };
  const base = await getPageMetadata(`/blog/${post.slug}`, post.title, post.excerpt || undefined);
  return {
    ...base,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || undefined,
      publishedTime: post.publishedAt ?? undefined,
      images: post.coverImageUrl ? [imageUrl(post.coverImageUrl, 1200)] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, all] = await Promise.all([getPublishedPost(slug), getPublishedPosts()]);
  if (!post) notFound();
  const more = all.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <main id="main-content" className="post-page">
      <article>
        <header className="post-hero container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/blog">Blog</Link>
          </nav>
          <p className="journal-meta">
            <time dateTime={post.publishedAt ?? undefined}>{formatPostDate(post.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            {post.readingMinutes} min read
          </p>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
        </header>
        {post.coverImageUrl && (
          <figure className="post-cover container">
            <img
              src={imageUrl(post.coverImageUrl, 1600)}
              srcSet={[720, 1080, 1600, 2000].map((w) => `${imageUrl(post.coverImageUrl!, w)} ${w}w`).join(", ")}
              sizes="(max-width: 1280px) 100vw, 1280px"
              alt=""
            />
          </figure>
        )}
        {/* Sanitized on save (sanitizeBlogHtml): only safe tags, https images, rel=noopener links. */}
        <div className="post-body" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
        <footer className="post-footer">
          <Link href="/blog" className="inline-link">
            <span aria-hidden="true">←</span> All stories
          </Link>
          <Link href="/shop" className="button">
            Shop the collection <Icon name="arrow" />
          </Link>
        </footer>
      </article>

      {more.length > 0 && (
        <section className="post-more" aria-labelledby="more-stories">
          <div className="container">
            <h2 id="more-stories">More from the blog</h2>
            <ul className="journal-grid">
              {more.map((p) => (
                <li key={p.id}>
                  <Link href={`/blog/${p.slug}`} className="journal-card">
                    <span className={p.coverImageUrl ? "journal-cover" : "journal-cover journal-cover-empty"} lang="bn">
                      {p.coverImageUrl ? <img src={imageUrl(p.coverImageUrl, 720)} alt="" loading="lazy" /> : "নকশা"}
                    </span>
                    <span className="journal-meta">{formatPostDate(p.publishedAt)}</span>
                    <span className="journal-title">{p.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
