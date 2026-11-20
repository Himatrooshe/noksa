import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostById } from "@/lib/blog-server";
import { Badge, PageHeader } from "../../board-ui";
import { ConfirmSubmitButton } from "../../confirm-submit-button";
import { PostEditor } from "../post-editor";
import { deletePostAction, savePostAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const post = await getPostById(id);
  if (!post) notFound();
  return (
    <>
      <PageHeader
        title={post.title}
        back={{ href: "/noksaboard/blog", label: "Back to blog" }}
        badges={post.status === "published" ? <Badge tone="success">Published</Badge> : <Badge tone="info">Draft</Badge>}
      />
      {created && <p className="board-banner board-banner-success">Post created.</p>}
      <PostEditor key={post.id} post={post} action={savePostAction.bind(null, post.id)} />
      <div className="board-danger-zone">
        <form action={deletePostAction.bind(null, post.id)}>
          <ConfirmSubmitButton confirmMessage={`Delete “${post.title}”? This can't be undone.`}>Delete post</ConfirmSubmitButton>
        </form>
      </div>
    </>
  );
}
