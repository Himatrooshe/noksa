-- Blog ("Journal") posts written in the dashboard. body_html is sanitized
-- before it is saved; images are ImageKit URLs uploaded from the editor.

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 160),
  excerpt text not null default '' check (char_length(excerpt) <= 400),
  cover_image_url text check (cover_image_url is null or cover_image_url like 'https://%'),
  body_html text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on blog_posts (status, published_at desc);
