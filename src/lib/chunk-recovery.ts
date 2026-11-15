export function isChunkLoadError(error: Pick<Error, "name" | "message">): boolean {
  return error.name === "ChunkLoadError" || /Loading (?:CSS )?chunk .+ failed/i.test(error.message);
}

/** Persist before reloading so a missing asset cannot cause a reload loop. */
export function claimChunkReload(
  error: Pick<Error, "name" | "message">,
  storage: Pick<Storage, "getItem" | "setItem">,
  url: string,
  now = Date.now(),
): boolean {
  if (!isChunkLoadError(error)) return false;
  const key = `noksa:chunk-reload:${url}`;
  try {
    const previous = storage.getItem(key);
    if (previous !== null && now - Number(previous) < 60_000) return false;
    storage.setItem(key, String(now));
    return true;
  } catch {
    // If storage is unavailable, leave recovery to the explicit reload button.
    return false;
  }
}
