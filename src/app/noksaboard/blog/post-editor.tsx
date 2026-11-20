"use client";
import { useActionState, useRef, useState } from "react";
import type { BlogPost, BlogStatus } from "@/lib/blog";
import { slugify } from "@/lib/products";
import type { ActionResult } from "../action-form";
import { RichTextEditor } from "../products/rich-text-editor";
import { uploadAdminImage } from "../upload-image";

type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

export function PostEditor({ post, action }: { post?: BlogPost; action: Action }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [cover, setCover] = useState(post?.coverImageUrl ?? "");
  const [body, setBody] = useState(post?.bodyHtml ?? "");
  const [status, setStatus] = useState<BlogStatus>(post?.status ?? "draft");
  const [coverBusy, setCoverBusy] = useState(false);
  const [coverError, setCoverError] = useState("");
  const coverInput = useRef<HTMLInputElement>(null);

  const effectiveSlug = slugTouched ? slug : slugify(title);

  async function uploadCover(file?: File) {
    if (!file) return;
    setCoverError("");
    setCoverBusy(true);
    try {
      setCover(await uploadAdminImage(file));
    } catch (error) {
      setCoverError(error instanceof Error ? error.message : "The image could not be uploaded.");
    } finally {
      setCoverBusy(false);
      if (coverInput.current) coverInput.current.value = "";
    }
  }

  const payload = JSON.stringify({ title, slug: effectiveSlug, excerpt, coverImageUrl: cover, bodyHtml: body, status });

  return (
    <form action={formAction} className="board-editor-grid">
      <input type="hidden" name="payload" value={payload} />
      <div className="board-editor-main">
        <section className="board-card board-form">
          <label className="board-field">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={160}
              required
              placeholder="From Bogura to the world"
            />
          </label>
          <label className="board-field">
            Excerpt
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              maxLength={400}
              placeholder="One or two sentences shown on the blog page and in search results."
            />
          </label>
          <div className="board-field">
            Story
            <RichTextEditor
              key={post?.id ?? "new"}
              initialHtml={post?.bodyHtml ?? ""}
              onChange={setBody}
              label="Post content"
              uploadImage={uploadAdminImage}
            />
            <span className="board-hint">Use 🖼 to add photos anywhere in the story. Images are optimized before upload.</span>
          </div>
        </section>
      </div>

      <div className="board-editor-side">
        <section className="board-card board-form">
          <h2 className="board-card-title">Visibility</h2>
          <label className="board-field">
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value as BlogStatus)}>
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published</option>
            </select>
          </label>
          {state?.error && (
            <p className="board-error" role="alert">
              {state.error}
            </p>
          )}
          {state?.ok && (
            <p className="board-success" role="status">
              {state.ok}
            </p>
          )}
          <button className="board-button board-button-primary" type="submit" disabled={pending || coverBusy}>
            {pending ? "Saving…" : status === "published" ? "Save & publish" : "Save draft"}
          </button>
          {post?.status === "published" && (
            <a className="board-hint" href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
              View on site ↗
            </a>
          )}
        </section>

        <section className="board-card board-form">
          <h2 className="board-card-title">Cover image</h2>
          {cover ? (
            <img className="board-post-cover" src={cover} alt="" />
          ) : (
            <p className="board-hint">Shown at the top of the post and on the blog page.</p>
          )}
          <div className="board-inline-form">
            <button type="button" className="board-button" onClick={() => coverInput.current?.click()} disabled={coverBusy}>
              {coverBusy ? "Uploading…" : cover ? "Replace" : "Upload image"}
            </button>
            {cover && (
              <button type="button" className="board-link-button danger" onClick={() => setCover("")}>
                Remove
              </button>
            )}
          </div>
          <input ref={coverInput} type="file" accept="image/*" hidden onChange={(e) => uploadCover(e.target.files?.[0])} />
          {coverError && (
            <p className="board-error" role="alert">
              {coverError}
            </p>
          )}
        </section>

        <section className="board-card board-form">
          <h2 className="board-card-title">URL</h2>
          <label className="board-field">
            /blog/
            <input
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="generated-from-the-title"
            />
          </label>
        </section>
      </div>
    </form>
  );
}
