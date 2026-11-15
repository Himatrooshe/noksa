-- Shopify-style catalog and order model.
--   * products gain status + inventory policy; price/stock move to variants
--     (every product has at least one variant, like Shopify's "Default Title")
--   * product_options / product_variants / product_media
--   * categories become many-to-many collections
--   * customers (identified by phone) and richer orders with separate
--     order / payment / fulfillment statuses and an event timeline
-- Existing rows are migrated in place.

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
alter table products
  add column if not exists status text not null default 'active',
  add column if not exists track_inventory boolean not null default true,
  add column if not exists continue_selling boolean not null default false;

alter table products drop constraint if exists products_status_check;
alter table products add constraint products_status_check
  check (status in ('active', 'draft', 'archived'));

-- ---------------------------------------------------------------------------
-- media (ordered; position 0 is the featured image)
-- ---------------------------------------------------------------------------
create table if not exists product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url text not null,
  alt text not null default '',
  position integer not null default 0
);
create index if not exists product_media_product_idx on product_media (product_id, position);

insert into product_media (product_id, url, position)
select id, image_url, 0 from products where image_url is not null and image_url <> '';
alter table products drop column if exists image_url;

-- ---------------------------------------------------------------------------
-- options + variants
-- ---------------------------------------------------------------------------
create table if not exists product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  name text not null,
  position integer not null default 0,
  option_values text[] not null default '{}'
);
create index if not exists product_options_product_idx on product_options (product_id, position);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  option1 text,
  option2 text,
  option3 text,
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price > price),
  sku text,
  stock integer not null default 0,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique nulls not distinct (product_id, option1, option2, option3)
);
create index if not exists product_variants_product_idx on product_variants (product_id, position);

-- Move each existing product's price/stock into a default variant.
insert into product_variants (product_id, price, stock, position)
select p.id, p.price, p.stock, 0
from products p
where not exists (select 1 from product_variants v where v.product_id = p.id);

alter table products drop column if exists price;
alter table products drop column if exists stock;

-- Stock can't go below zero for a tracked product unless it allows
-- overselling ("continue selling when out of stock"). Enforced here so order
-- creation inside a transaction rolls back cleanly on insufficient stock.
create or replace function enforce_variant_stock()
returns trigger
language plpgsql
as $$
declare
  tracked boolean;
  oversell boolean;
  pname text;
begin
  select p.track_inventory, p.continue_selling, p.name
    into tracked, oversell, pname
    from products p where p.id = new.product_id;
  if new.stock < 0 and tracked and not oversell then
    raise exception 'Not enough stock for "%"', pname using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists product_variants_stock_check on product_variants;
create trigger product_variants_stock_check
  before insert or update of stock on product_variants
  for each row execute function enforce_variant_stock();

-- ---------------------------------------------------------------------------
-- collections (replace categories)
-- ---------------------------------------------------------------------------
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique,
  title text not null,
  description text not null default '',
  image_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists product_collections (
  product_id uuid not null references products (id) on delete cascade,
  collection_id uuid not null references collections (id) on delete cascade,
  primary key (product_id, collection_id)
);
create index if not exists product_collections_collection_idx on product_collections (collection_id);

do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'categories') then
    insert into collections (id, handle, title, position, created_at)
    select c.id,
           trim(both '-' from regexp_replace(lower(c.name), '[^a-z0-9]+', '-', 'g')),
           c.name, c.sort_order, c.created_at
    from categories c
    on conflict do nothing;

    insert into product_collections (product_id, collection_id)
    select p.id, p.category_id from products p where p.category_id is not null
    on conflict do nothing;

    alter table products drop column if exists category_id;
    drop table categories;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- customers (phone is the identifier — most Bangladeshi shoppers order by
-- phone/Facebook/WhatsApp, not email)
-- ---------------------------------------------------------------------------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  email text,
  address text,
  city text,
  note text not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- orders: three independent status axes, like Shopify
-- ---------------------------------------------------------------------------
alter table orders
  add column if not exists order_number integer generated by default as identity (start with 1001),
  add column if not exists customer_id uuid references customers (id) on delete set null,
  add column if not exists payment_status text not null default 'pending',
  add column if not exists fulfillment_status text not null default 'unfulfilled',
  add column if not exists payment_method text not null default 'cod',
  add column if not exists transaction_id text,
  add column if not exists subtotal integer not null default 0,
  add column if not exists shipping_fee integer not null default 0,
  add column if not exists discount integer not null default 0,
  add column if not exists note text not null default '',
  add column if not exists courier text,
  add column if not exists tracking_number text,
  add column if not exists paid_at timestamptz,
  add column if not exists fulfilled_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists archived_at timestamptz;

-- The old single `status` column (pending/processing/shipped/completed/
-- cancelled) is split across the three axes; `status` now means
-- open / archived / cancelled.
alter table orders drop constraint if exists orders_status_check;
update orders set
  fulfillment_status = case status
    when 'shipped' then 'fulfilled'
    when 'completed' then 'delivered'
    else fulfillment_status end,
  payment_status = case status when 'completed' then 'paid' else payment_status end,
  status = case status
    when 'cancelled' then 'cancelled'
    when 'completed' then 'archived'
    else 'open' end
where status not in ('open', 'archived');
alter table orders alter column status set default 'open';

alter table orders drop constraint if exists orders_status_axis_check;
alter table orders add constraint orders_status_axis_check
  check (status in ('open', 'archived', 'cancelled'));
alter table orders drop constraint if exists orders_payment_status_check;
alter table orders add constraint orders_payment_status_check
  check (payment_status in ('pending', 'paid', 'refunded', 'voided'));
alter table orders drop constraint if exists orders_fulfillment_status_check;
alter table orders add constraint orders_fulfillment_status_check
  check (fulfillment_status in ('unfulfilled', 'fulfilled', 'delivered'));
alter table orders drop constraint if exists orders_payment_method_check;
alter table orders add constraint orders_payment_method_check
  check (payment_method in ('cod', 'bkash', 'nagad', 'bank_transfer', 'cash', 'other'));

create unique index if not exists orders_order_number_idx on orders (order_number);
create index if not exists orders_customer_idx on orders (customer_id);

alter table order_items
  add column if not exists variant_id uuid references product_variants (id) on delete set null,
  add column if not exists variant_title text,
  add column if not exists sku text;

create table if not exists order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on order_events (order_id, created_at);
