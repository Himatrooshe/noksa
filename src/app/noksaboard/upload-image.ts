// Browser-side image upload shared by dashboard editors: resize to a sensible
// size, then send to the authenticated /api/admin/media route (ImageKit).

export const MAX_SOURCE_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_SAVED_IMAGE_BYTES = 1_500_000;

/** Downscale to at most 1600px on the long edge; WebP unless a small PNG. */
export function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const maxEdge = 1600;
        const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("Canvas unavailable"));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const outputType = file.type === "image/png" && file.size < 750_000 ? "image/png" : "image/webp";
        resolve(canvas.toDataURL(outputType, 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/** Validates, optimizes and uploads an image; returns its public HTTPS URL. */
export async function uploadAdminImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose a JPG, PNG, WebP, GIF, or other image file.");
  if (file.size > MAX_SOURCE_IMAGE_BYTES) throw new Error("That image is larger than 8 MB. Choose a smaller file.");
  const dataUrl = await resizeImage(file);
  if (Math.ceil((dataUrl.length * 3) / 4) > MAX_SAVED_IMAGE_BYTES) {
    throw new Error("The optimized image is still too large. Try a smaller photo.");
  }
  const blob = await (await fetch(dataUrl)).blob();
  const form = new FormData();
  form.set("file", blob, "image.webp");
  const response = await fetch("/api/admin/media", { method: "POST", body: form });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || typeof result.url !== "string") {
    throw new Error(result.error || "The image could not be uploaded. Try again.");
  }
  return result.url;
}
