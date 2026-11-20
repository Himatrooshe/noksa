"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveUploadedVideoAction } from "./actions";

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

type UploadAuth = { token: string; expire: number; signature: string; publicKey: string; folder: string };
type UploadResult = { fileId?: unknown; url?: unknown; message?: unknown };

/** Uploads straight from the browser to ImageKit with a server-signed token, showing progress. */
function uploadToImageKit(file: File, auth: UploadAuth, onProgress: (percent: number) => void) {
  return new Promise<{ fileId: string | null; url: string }>((resolve, reject) => {
    const form = new FormData();
    form.set("file", file);
    form.set("fileName", file.name.replace(/[^\w.-]+/g, "-").slice(-100) || "video.mp4");
    form.set("folder", auth.folder);
    form.set("useUniqueFileName", "true");
    form.set("publicKey", auth.publicKey);
    form.set("signature", auth.signature);
    form.set("expire", String(auth.expire));
    form.set("token", auth.token);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => reject(new Error("The upload was interrupted. Check your connection and try again."));
    xhr.onload = () => {
      let result: UploadResult = {};
      try { result = JSON.parse(xhr.responseText); } catch { /* handled below */ }
      if (xhr.status >= 200 && xhr.status < 300 && typeof result.url === "string") {
        resolve({ url: result.url, fileId: typeof result.fileId === "string" ? result.fileId : null });
      } else {
        const message = typeof result.message === "string" ? result.message : `status ${xhr.status}`;
        reject(new Error(`ImageKit rejected the upload: ${message}`));
      }
    };
    xhr.send(form);
  });
}

export function VideoUploader() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const busy = progress !== null;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setOk(null);
    const data = new FormData(event.currentTarget);
    const file = data.get("file");
    const title = String(data.get("title") ?? "").trim();
    if (!(file instanceof File) || !file.size) return setError("Choose a video file.");
    if (!VIDEO_TYPES.includes(file.type)) return setError("Choose an MP4, WebM or MOV video.");
    if (file.size > MAX_VIDEO_BYTES) return setError("The video must be smaller than 100 MB.");
    if (!title) return setError("Add a title for the video.");

    setProgress(0);
    try {
      const authResponse = await fetch("/api/admin/video-upload-auth", { method: "POST" });
      const auth = await authResponse.json();
      if (!authResponse.ok) throw new Error(auth.error ?? "Couldn't start the upload.");
      const uploaded = await uploadToImageKit(file, auth, setProgress);
      const result = await saveUploadedVideoAction({
        title,
        caption: String(data.get("caption") ?? ""),
        url: uploaded.url,
        fileId: uploaded.fileId,
        showcase: data.get("showcase") === "on",
      });
      if (result?.error) throw new Error(result.error);
      setOk(result?.ok ?? "Video saved.");
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The video could not be uploaded.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <form ref={formRef} className="board-form board-video-upload" onSubmit={onSubmit}>
      <label className="board-field">
        Video file
        <input name="file" type="file" accept={VIDEO_TYPES.join(",")} required disabled={busy} />
        <span className="board-hint">MP4, WebM or MOV, up to 100 MB. A short landscape clip (10–40 seconds) works best.</span>
      </label>
      <label className="board-field">
        Title
        <input name="title" required maxLength={120} placeholder="Made by hand in Bangladesh" disabled={busy} />
      </label>
      <label className="board-field">
        Caption
        <textarea name="caption" rows={3} maxLength={400} placeholder="Optional — a line or two shown beside the video" disabled={busy} />
      </label>
      <label className="board-checkbox">
        <input type="checkbox" name="showcase" defaultChecked disabled={busy} />
        Showcase this video on the home page
      </label>
      {busy && (
        <div className="board-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${progress}%` }} />
          <em>{progress < 100 ? `Uploading… ${progress}%` : "Processing…"}</em>
        </div>
      )}
      {error && <p className="board-error" role="alert">{error}</p>}
      {ok && <p className="board-success" role="status">{ok}</p>}
      <div>
        <button className="board-button board-button-primary" type="submit" disabled={busy}>
          {busy ? "Uploading…" : "Upload video"}
        </button>
      </div>
    </form>
  );
}
