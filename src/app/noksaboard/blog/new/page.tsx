import type { Metadata } from "next";
import { PageHeader } from "../../board-ui";
import { PostEditor } from "../post-editor";
import { savePostAction } from "../actions";

export const metadata: Metadata = { title: "Write a post" };

export default function NewPostPage() {
  return (
    <>
      <PageHeader title="Write a post" back={{ href: "/noksaboard/blog", label: "Back to blog" }} />
      <PostEditor action={savePostAction.bind(null, null)} />
    </>
  );
}
