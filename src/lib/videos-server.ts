import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";
import { sql } from "@/lib/db";
import { isUuid } from "@/lib/products-server";

export type ShowcaseVideo = {
  id: string;
  title: string;
  caption: string;
  url: string;
  isShowcased: boolean;
  createdAt: string;
};

type VideoRow = {
  id: string;
  title: string;
  caption: string;
  url: string;
  is_showcased: boolean;
  created_at: string | Date;
};

const SHOWCASE_TAG = "showcase-video";

function mapVideo(row: VideoRow): ShowcaseVideo {
  return {
    id: row.id,
    title: row.title,
    caption: row.caption,
    url: row.url,
    isShowcased: row.is_showcased,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

/** Postgres "undefined_table": migration 004 hasn't been applied to this database yet. */
export function isMissingVideoTable(err: unknown): boolean {
  return (err as { code?: unknown })?.code === "42P01";
}

export async function getVideos(): Promise<ShowcaseVideo[]> {
  const rows = (await sql`
    select id, title, caption, url, is_showcased, created_at
    from showcase_videos order by is_showcased desc, created_at desc
  `) as unknown as VideoRow[];
  return rows.map(mapVideo);
}

/** The home page's showcased video, or null when none is chosen. Cached; writes below clear it. */
export const getShowcasedVideo = unstable_cache(
  async (): Promise<ShowcaseVideo | null> => {
    try {
      const [row] = (await sql`
        select id, title, caption, url, is_showcased, created_at
        from showcase_videos where is_showcased limit 1
      `) as unknown as VideoRow[];
      return row ? mapVideo(row) : null;
    } catch (err) {
      // Before migration 004 runs, the home page simply has no video section.
      if (isMissingVideoTable(err)) return null;
      throw err;
    }
  },
  ["showcased-video"],
  { revalidate: 300, tags: [SHOWCASE_TAG] },
);

export type VideoInput = { title: string; caption: string; url: string; fileId: string | null };

export async function createVideo(input: VideoInput, showcase: boolean): Promise<string> {
  const id = crypto.randomUUID();
  const queries = [];
  if (showcase) queries.push(sql`update showcase_videos set is_showcased = false where is_showcased`);
  queries.push(sql`
    insert into showcase_videos (id, title, caption, url, file_id, is_showcased)
    values (${id}, ${input.title}, ${input.caption}, ${input.url}, ${input.fileId}, ${showcase})
  `);
  await sql.transaction(queries);
  revalidateTag(SHOWCASE_TAG);
  return id;
}

export async function updateVideoText(id: string, title: string, caption: string): Promise<void> {
  if (!isUuid(id)) return;
  await sql`update showcase_videos set title = ${title}, caption = ${caption} where id = ${id}`;
  revalidateTag(SHOWCASE_TAG);
}

/** Showcase one video (clearing any other), or pass null to hide the section. */
export async function setShowcasedVideo(id: string | null): Promise<void> {
  if (id !== null && !isUuid(id)) return;
  await sql.transaction([
    sql`update showcase_videos set is_showcased = false where is_showcased`,
    ...(id ? [sql`update showcase_videos set is_showcased = true where id = ${id}`] : []),
  ]);
  revalidateTag(SHOWCASE_TAG);
}

/** Removes the video from the dashboard. The ImageKit file is kept, as with product images. */
export async function deleteVideo(id: string): Promise<void> {
  if (!isUuid(id)) return;
  await sql`delete from showcase_videos where id = ${id}`;
  revalidateTag(SHOWCASE_TAG);
}
