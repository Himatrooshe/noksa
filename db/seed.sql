-- Optional sample catalog for a fresh database (run after migrations:
-- `npm run db:migrate -- --seed`). Safe to re-run: existing rows are kept.

insert into collections (handle, title, position) values
  ('everyday-bags', 'Everyday bags', 1),
  ('home-living', 'Home & living', 2),
  ('accessories', 'Accessories', 3)
on conflict (handle) do nothing;

insert into products (slug, name, color, shape, description, dimensions)
values
  ('everyday-jute-tote', 'The everyday tote', '#bba078', 'tote',
    '<p>A simple, roomy companion for market mornings and everything that follows. Natural jute, comfortable handles, and space for your daily essentials.</p>',
    '38 x 34 x 12 cm'),
  ('woven-storage-basket', 'The woven basket', '#c4a478', 'basket',
    '<p>A little order, a lot of warmth. A woven basket for the blankets, plants, and small things that make a house your home.</p>',
    '28 x 28 x 26 cm'),
  ('little-jute-pouch', 'The little pouch', '#b8aa8d', 'pouch',
    '<p>Keep the little things together. A compact jute pouch for your keys, everyday essentials, or a thoughtfully chosen gift.</p>',
    '22 x 16 x 5 cm'),
  ('weekend-jute-bag', 'The weekend bag', '#ac8b66', 'round',
    '<p>Made for slower days and spontaneous plans. A relaxed, rounded carryall with a generous interior and natural woven texture.</p>',
    '40 x 36 x 14 cm')
on conflict (slug) do nothing;

insert into product_variants (product_id, price, stock)
select p.id, v.price, v.stock
from (values
  ('everyday-jute-tote', 850, 12),
  ('woven-storage-basket', 1250, 8),
  ('little-jute-pouch', 450, 20),
  ('weekend-jute-bag', 1450, 6)
) as v(slug, price, stock)
join products p on p.slug = v.slug
where not exists (select 1 from product_variants pv where pv.product_id = p.id);

insert into product_collections (product_id, collection_id)
select p.id, c.id
from (values
  ('everyday-jute-tote', 'everyday-bags'),
  ('woven-storage-basket', 'home-living'),
  ('little-jute-pouch', 'accessories'),
  ('weekend-jute-bag', 'everyday-bags')
) as v(slug, handle)
join products p on p.slug = v.slug
join collections c on c.handle = v.handle
on conflict do nothing;
