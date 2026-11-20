import type { Metadata } from "next";
import { getVideos, isMissingVideoTable, type ShowcaseVideo } from "@/lib/videos-server";
import { ActionForm } from "../action-form";
import { Badge, Card, PageHeader } from "../board-ui";
import { ConfirmSubmitButton } from "../confirm-submit-button";
import { deleteVideoAction, showcaseVideoAction, updateVideoAction } from "./actions";
import { VideoUploader } from "./video-uploader";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Videos" };

export default async function BoardVideosPage() {
  let videos: ShowcaseVideo[];
  try {
    videos = await getVideos();
  } catch (err) {
    if (!isMissingVideoTable(err)) throw err;
    return (
      <>
        <PageHeader title="Videos" />
        <Card title="Database setup needed">
          <p className="board-hint">
            The videos table doesn&apos;t exist in this database yet. Run <code>npm run db:migrate</code> (production
            deploys run it automatically with <code>npm run build:production</code>), then reload this page.
          </p>
        </Card>
      </>
    );
  }
  const showcased = videos.find((video) => video.isShowcased);
  return (
    <>
      <PageHeader
        title="Videos"
        subtitle="Upload videos and choose which one plays in the home page's video showcase."
      />
      <div className="board-editor-grid">
        <div className="board-editor-main">
          <Card title={`Library (${videos.length})`}>
            {videos.length === 0 ? (
              <p className="board-empty">No videos yet. Upload one to start the showcase.</p>
            ) : (
              <ul className="board-video-list">
                {videos.map((video) => (
                  <li key={video.id} className={video.isShowcased ? "board-video showcased" : "board-video"}>
                    <video src={video.url.startsWith("https://ik.imagekit.io/") ? `${video.url}?tr=w-640,q-50` : video.url} preload="metadata" controls muted playsInline />
                    <div className="board-video-body">
                      <div className="board-video-status">
                        {video.isShowcased ? <Badge tone="success">Showcased on home page</Badge> : <Badge>Not shown</Badge>}
                        <span className="board-hint">Added {new Date(video.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
                      </div>
                      <ActionForm action={updateVideoAction.bind(null, video.id)} submitLabel="Save text" variant="secondary">
                        <label className="board-field">
                          Title
                          <input name="title" required maxLength={120} defaultValue={video.title} />
                        </label>
                        <label className="board-field">
                          Caption
                          <textarea name="caption" rows={2} maxLength={400} defaultValue={video.caption} />
                        </label>
                      </ActionForm>
                      <div className="board-video-actions">
                        {video.isShowcased ? (
                          <form action={showcaseVideoAction.bind(null, null)}>
                            <button type="submit" className="board-button">Hide from home page</button>
                          </form>
                        ) : (
                          <form action={showcaseVideoAction.bind(null, video.id)}>
                            <button type="submit" className="board-button board-button-primary">Showcase this video</button>
                          </form>
                        )}
                        <form action={deleteVideoAction.bind(null, video.id)}>
                          <ConfirmSubmitButton confirmMessage={`Delete “${video.title}” from the library?`}>
                            Delete
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <div className="board-editor-side">
          <Card title="Upload a video">
            <VideoUploader />
          </Card>
          <Card title="Home page">
            <p className="board-hint">
              {showcased
                ? <>Now showing: <strong>{showcased.title}</strong>. Only one video is shown at a time.</>
                : "No video is showcased, so the section is hidden on the home page."}
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
