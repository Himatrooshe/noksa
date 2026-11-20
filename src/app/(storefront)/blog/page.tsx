import Link from "next/link";
import { BlogIndex, paginateBlog } from "@/components/journal-listing";
import { getPublishedPosts } from "@/lib/blog-server";
import { getPageMetadata } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Search = Promise<{ page?: string; q?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: Search }) {
  const { page } = await searchParams;
  const n = Number(page);
  return getPageMetadata(
    n > 1 ? `/blog?page=${n}` : "/blog",
    n > 1 ? `Blog, page ${n}` : "Blog",
    "Stories from Noksa: Bangladeshi jute, the hands that shape it, and the everyday bags we make.",
  );
}

export default async function BlogPage({ searchParams }: { searchParams: Search }) {
  const { page: pageParam, q = "" } = await searchParams;
  const query = q.slice(0, 80);
  const all = await getPublishedPosts();
  const { page, totalPages, total, posts } = paginateBlog(all, Number(pageParam ?? 1), query);

  return (
    <main id="main-content" className="blog-page">
      <header className="blog-header">
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Blog</span>
          </nav>
          <h1>Blog</h1>
          <p>Stories about jute, craft and the people behind every Noksa bag.</p>
        </div>
      </header>
      <div className="container">
        <BlogIndex posts={posts} recent={all.slice(0, 4)} page={page} totalPages={totalPages} total={total} query={query} />
      </div>
    </main>
  );
}
