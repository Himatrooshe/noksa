/** ImageKit transformations keep full-size files out of grids and thumbnails. */
export function imageUrl(source: string, width: number): string {
  try {
    const url = new URL(source);
    if (url.hostname !== "ik.imagekit.io") return source;
    url.searchParams.set("tr", `w-${width},q-80,f-auto`);
    return url.href;
  } catch {
    return source;
  }
}
