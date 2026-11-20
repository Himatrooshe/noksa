import Link from "next/link";
import type { Metadata } from "next";
import { formatPostDate, type BlogPostSummary } from "@/lib/blog";
import { getAllPosts, isMissingBlogTable } from "@/lib/blog-server";
import { Badge, Card, PageHeader } from "../board-ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Blog" };

export default async function BoardBlogPage() {
  let posts: BlogPostSummary[];
  try {
    posts = await getAllPosts();
  } catch (err) {
    if (!isMissingBlogTable(err)) throw err;
    return (
      <>
        <PageHeader title="Blog" />
        <Card title="Database setup needed">
          <p className="board-hint">
            The blog table doesn&apos;t exist in this database yet. Run <code>npm run db:migrate</code>, then reload.
          </p>
        </Card>
      </>
    );
  }
  return (
    <>
      <PageHeader
        title="Blog"
        subtitle="Write stories for the Noksa Journal. Drafts stay hidden until you publish."
        actions={
          <Link href="/noksaboard/blog/new" className="board-button board-button-primary">
            Write a post
          </Link>
        }
      />
      {posts.length === 0 ? (
        <p className="board-empty">No posts yet. Write the first story.</p>
      ) : (
        <div className="board-table-wrap">
          <table className="board-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Published</th>
                <th>Last edited</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <Link href={`/noksaboard/blog/${post.id}`} className="board-cell-link">
                      {post.title}
                    </Link>
                  </td>
                  <td>
                    {post.status === "published" ? <Badge tone="success">Published</Badge> : <Badge tone="info">Draft</Badge>}
                  </td>
                  <td className="board-cell-muted">{formatPostDate(post.publishedAt) || "—"}</td>
                  <td className="board-cell-muted">{formatPostDate(post.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
