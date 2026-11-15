-- Noksa storefront + admin schema (plain Postgres, works on Neon).
-- Run this once against a fresh database (Neon SQL Editor, or `psql "$DATABASE_URL" -f db/schema.sql`).
--
-- No per-user accounts and no Row Level Security here: the admin dashboard
-- is gated by a single shared password at the application layer
-- (src/lib/admin-session.ts), not by database-level user identity. The one
-- Postgres connection the app uses has full access to these tables.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_id uuid references categories (id) on delete set null,
  price integer not null check (price >= 0), -- whole BDT taka, matches formatPrice()
  stock integer not null default 0 check (stock >= 0),
  color text not null default '#bba078',
  shape text not null default 'tote' check (shape in ('tote', 'basket', 'pouch', 'round')),
  description text not null default '',
  dimensions text not null default '',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- orders + order_items (schema ready for when checkout ships)
-- ---------------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text,
  customer_phone text,
  shipping_address text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
  total integer not null default 0 check (total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  product_name text not null, -- snapshot, survives product edits/deletes
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0)
);

create index if not exists order_items_order_id_idx on order_items (order_id);
create index if not exists products_category_id_idx on products (category_id);
