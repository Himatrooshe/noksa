-- Videos uploaded from the dashboard for the home page's video showcase.
-- Files live in ImageKit; this table stores their public URLs. At most one
-- video is showcased at a time (enforced by the partial unique index).

create table if not exists showcase_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  caption text not null default '' check (char_length(caption) <= 400),
  url text not null check (url like 'https://%'),
  file_id text,
  is_showcased boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists showcase_videos_one_showcased
  on showcase_videos (is_showcased) where is_showcased;
