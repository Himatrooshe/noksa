-- Initial published US catalog: eight products, four collections, 57 gallery images.
-- Prices are whole USD; initial stock is 10. Images are public ImageKit URLs.
-- Insert missing records only. Never reset prices, stock, content, or visibility
-- for products already managed in production. schema_migrations runs this once.

insert into collections (id, handle, title, description, image_url, position) values
('f2f94bd5-58c0-4d3c-a90e-a8c82aca3c90', 'fanny-bags', 'Fanny bags', 'Compact bags with adjustable straps for keeping everyday essentials close.', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/4a6df1ffced2764ab622aa5a04a2d1f77a779b041044472f3bff2b6ed8f1234f.webp', 0),
('e22594de-7782-4918-a58b-8537a73106ba', 'grocery-bags', 'Grocery bags', 'Roomy woven bags in tall and wide shapes for shopping and everyday carrying.', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/304befef501199ac0926b50d4a79c73df238093a9f0dc836014e47f0df90d227.webp', 1),
('44dd9a12-f2a4-4f1c-af1a-ce3940f96499', 'sling-bags', 'Sling bags', 'Compact shoulder bags with geometric patterns and adjustable straps.', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/d9b5c6ec14c11707365fa452cf5d39649c2fcadadc0aa3422a339852ddb4b228.webp', 2),
('239767e7-b338-4b5f-a02d-05f3eeb3dc21', 'tote-bags', 'Tote bags', 'Natural woven totes with colorful wave panels and long carry handles.', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/ba03c5688e1d3e99d25efa73ad52845f26969fec226d97abc5ecf3e1ec73c1d5.webp', 3)
on conflict do nothing;

insert into products (id, slug, name, status, description, dimensions, color, shape, track_inventory, continue_selling) values
('7d77f4d5-89a3-4c52-a3b9-73d85b6b4087', 'fanny-bag-desert-sand', 'Fanny Bag — Desert Sand', 'active', '<p>Keep your daily essentials close in a compact bag with a soft desert-sand finish and contrasting black details. The adjustable strap makes it easy to wear across the body for errands, walks, and days out.</p><ul><li>Neutral textured exterior with a Noksa logo patch</li><li>Zipped main compartment and front zip pocket</li><li>Adjustable black strap with clip attachments</li></ul><p>Dimensions: 13 × 6.5 inches (W × H).</p>', '13 × 6.5 inches (W × H)', '#ded4bf', 'pouch', true, false),
('584970d7-a44c-4bb3-a4f9-608cbfce1ec6', 'fanny-bag-midnight-blue', 'Fanny Bag — Midnight Blue', 'active', '<p>A compact everyday bag in a deep midnight-blue shade. Wear it across the body to keep small essentials within reach, with a zipped front pocket for the items you use most.</p><ul><li>Midnight-blue exterior with contrasting black trim</li><li>Zipped main compartment and front zip pocket</li><li>Adjustable black strap with clip attachments</li></ul><p>Dimensions: 13 × 6.5 inches (W × H).</p>', '13 × 6.5 inches (W × H)', '#364359', 'pouch', true, false),
('0bfcc6f9-b409-4f1f-a954-386f7a230a02', 'heavy-duty-grocery-bag-long', 'Heavy Duty Grocery Bag — Long', 'active', '<p>A tall grocery bag in a natural woven finish, made for market trips and everyday carrying. Its simple shape pairs a roomy interior with twin carry handles and a small Noksa logo patch.</p><ul><li>Tall rectangular profile</li><li>Natural woven exterior and twin carry handles</li><li>Open-top design for easy packing</li></ul><p>Dimensions: 13 × 15 inches (W × H).</p>', '13 × 15 inches (W × H)', '#c8af83', 'tote', true, false),
('3ca3953f-7082-4460-a5ad-8eea36bc94d0', 'heavy-duty-grocery-bag-square', 'Heavy Duty Grocery Bag — Square', 'active', '<p>A wide grocery bag with a natural woven finish and an easy-to-pack open top. The square profile offers space for shopping, picnic supplies, or daily essentials, while twin handles keep the design simple and practical.</p><ul><li>Wide rectangular profile</li><li>Natural woven exterior and twin carry handles</li><li>Open-top design for easy access</li></ul><p>Dimensions: 14.5 × 13 inches (W × H).</p>', '14.5 × 13 inches (W × H)', '#c8af83', 'tote', true, false),
('1f27c881-57ca-49e2-a804-0d06d101910e', 'sling-bag-nevada-red', 'Sling Bag — Nevada Red', 'active', '<p>Add a patterned accent to your everyday outfit with the Nevada Red sling bag. Its red geometric design sits against a neutral background, paired with a matching neutral strap for hands-free carrying.</p><ul><li>Red geometric pattern with a Noksa logo patch</li><li>Compact rectangular silhouette</li><li>Adjustable neutral-colored strap and zip closure</li></ul><p>Dimensions: 9 × 6 inches (W × H).</p>', '9 × 6 inches (W × H)', '#ab4d45', 'pouch', true, false),
('abe508b9-c1f0-41b2-a522-29b136e1cf54', 'sling-bag-tuscan-green', 'Sling Bag — Tuscan Green', 'active', '<p>The Tuscan Green sling bag brings an earthy green geometric pattern to a compact everyday shape. A neutral strap complements the patterned exterior, keeping your small essentials close on days out.</p><ul><li>Green geometric pattern with a Noksa logo patch</li><li>Compact rectangular silhouette</li><li>Adjustable neutral-colored strap and zip closure</li></ul><p>Dimensions: 9 × 6 inches (W × H).</p>', '9 × 6 inches (W × H)', '#637650', 'pouch', true, false),
('141b24b0-9333-4d9c-a4de-6b33fac8852f', 'tote-bag-green-wave', 'Tote Bag — Green Wave', 'active', '<p>A natural woven tote with a bright green-and-yellow wave panel down the front. Long twin handles and a generous upright shape make it an easy companion for everyday errands, books, and personal essentials.</p><ul><li>Natural woven body with a green-and-yellow wave panel</li><li>Long twin carry handles</li><li>Small Noksa logo patch at the front</li></ul><p>Dimensions: 14 × 15 inches (W × H).</p>', '14 × 15 inches (W × H)', '#63885c', 'tote', true, false),
('26b27e08-2792-4060-a9a3-4fde65daf459', 'tote-bag-orange-wave', 'Tote Bag — Orange Wave', 'active', '<p>Bring a warm accent to your daily carry with the Orange Wave tote. A bold orange patterned panel runs down the natural woven body, while long handles and a gusseted shape provide a practical everyday silhouette.</p><ul><li>Natural woven body with an orange wave panel</li><li>Long twin carry handles</li><li>Gusseted base and a small Noksa logo patch</li></ul><p>Dimensions: 14 × 15 × 4 inches (W × H × D).</p>', '14 × 15 × 4 inches (W × H × D)', '#c77b26', 'tote', true, false)
on conflict do nothing;

insert into product_variants (id, product_id, price, compare_at_price, sku, stock, position)
select 'e276c0d8-852d-45e7-a419-b2ece48582d4'::uuid, p.id, 22, null::integer, null::text, 10, 0
from products p where p.slug = 'heavy-duty-grocery-bag-long'
  and not exists (select 1 from product_variants existing where existing.product_id = p.id)
on conflict do nothing;

insert into product_variants (id, product_id, price, compare_at_price, sku, stock, position)
select '62365601-5683-4bae-afcc-3854ce1640f1'::uuid, p.id, 32, null::integer, null::text, 10, 0
from products p where p.slug = 'tote-bag-green-wave'
  and not exists (select 1 from product_variants existing where existing.product_id = p.id)
on conflict do nothing;

insert into product_variants (id, product_id, price, compare_at_price, sku, stock, position)
select '22596a2b-2807-4092-aaa5-f15b029f38fd'::uuid, p.id, 24, null::integer, null::text, 10, 0
from products p where p.slug = 'sling-bag-nevada-red'
  and not exists (select 1 from product_variants existing where existing.product_id = p.id)
on conflict do nothing;

insert into product_variants (id, product_id, price, compare_at_price, sku, stock, position)
select 'e4ca6fd0-43ac-4489-a26b-5f06cd5174a2'::uuid, p.id, 32, null::integer, null::text, 10, 0
from products p where p.slug = 'tote-bag-orange-wave'
  and not exists (select 1 from product_variants existing where existing.product_id = p.id)
on conflict do nothing;

insert into product_variants (id, product_id, price, compare_at_price, sku, stock, position)
select '432818d8-2fd3-42b1-acf9-5cdf4f9371de'::uuid, p.id, 24, null::integer, null::text, 10, 0
from products p where p.slug = 'heavy-duty-grocery-bag-square'
  and not exists (select 1 from product_variants existing where existing.product_id = p.id)
on conflict do nothing;

insert into product_variants (id, product_id, price, compare_at_price, sku, stock, position)
select 'bc33628b-1e4c-4b16-a5c5-89a38ccf200a'::uuid, p.id, 29, null::integer, null::text, 10, 0
from products p where p.slug = 'fanny-bag-midnight-blue'
  and not exists (select 1 from product_variants existing where existing.product_id = p.id)
on conflict do nothing;

insert into product_variants (id, product_id, price, compare_at_price, sku, stock, position)
select 'dbc263e6-603b-45b1-a544-879db1df01e5'::uuid, p.id, 29, null::integer, null::text, 10, 0
from products p where p.slug = 'fanny-bag-desert-sand'
  and not exists (select 1 from product_variants existing where existing.product_id = p.id)
on conflict do nothing;

insert into product_variants (id, product_id, price, compare_at_price, sku, stock, position)
select '25a516a1-a300-4e1a-a49b-77ee3372df30'::uuid, p.id, 24, null::integer, null::text, 10, 0
from products p where p.slug = 'sling-bag-tuscan-green'
  and not exists (select 1 from product_variants existing where existing.product_id = p.id)
on conflict do nothing;

insert into product_media (id, product_id, url, alt, position)
select source.id::uuid, p.id, source.url, source.alt, source.position
from (values
('3e0260a4-c689-455e-bbf0-67a5a3a707eb', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/4a6df1ffced2764ab622aa5a04a2d1f77a779b041044472f3bff2b6ed8f1234f.webp', 'Fanny Bag — Desert Sand, main view', 0),
('6d5e0dcd-4234-49d8-a372-5336d2fe78e2', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/566769aced44e163b20ef772773f1491f6a564d4287317f1bd3604c69b94ab02.webp', 'Fanny Bag — Desert Sand, detail view DS1', 1),
('6ab5d033-3619-400d-8633-118153138d3a', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/aece040d4dc3787f84ac5a3f0964aa01d4c91bdb88d83b49dfe372a576205e15.webp', 'Fanny Bag — Desert Sand, detail view DS2', 2),
('0008efbe-e085-45ab-a52f-2730d94bc2a8', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/86be67ca09803d5c093d3e25c7dad031c8f89488af6a3ac3aa889f67c3c82395.webp', 'Fanny Bag — Desert Sand, detail view DS3', 3),
('003332c0-5099-48dd-8833-e362cf4944c0', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/f13b55d0b96a35a23b254cfc79bebbdda4586c44e0680b1bf3e44c06b2faff74.webp', 'Fanny Bag — Desert Sand, detail view DS4', 4),
('9a4e0c14-a67a-4cb4-91df-953409ad7846', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/60be37ad69e418dd9e04cebdbf3073dbe9cfea1fcbcda4b7d4f861ce7319b934.webp', 'Fanny Bag — Desert Sand, interior view', 5),
('96edda78-95f9-470c-9bfb-ac30df702b76', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/73b59b0c503770d788426a2361fdfbf34b0b8f625d46e07575e3d912133033c7.webp', 'Fanny Bag — Desert Sand, dimension guide', 6)
) as source(id, url, alt, position)
join products p on p.slug = 'fanny-bag-desert-sand'
where not exists (select 1 from product_media existing where existing.product_id = p.id and existing.url = source.url)
on conflict do nothing;

insert into product_media (id, product_id, url, alt, position)
select source.id::uuid, p.id, source.url, source.alt, source.position
from (values
('3aa6412c-0444-4fd2-a8d4-0571bb4b14e4', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/d07c8e89d0232e4fc6e17cc6739ba94559d739c3ab207f1baae1cbeaa942953c.webp', 'Fanny Bag — Midnight Blue, main view', 0),
('774d190c-0d76-4efd-ad60-e378f2798e58', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/3e00c03a2d303025a84dd8c72a852faa5c5fab4e00c8843efdbfcd3b8f68a9c6.webp', 'Fanny Bag — Midnight Blue, detail view MB1', 1),
('56905d19-9042-4637-a38e-009fb54f13ef', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/eade7fec08299a271c9d77c2c9850485a41f9d3bd9233a5ebb4e628de05cac01.webp', 'Fanny Bag — Midnight Blue, detail view MB3', 2),
('08233d99-1a71-4b65-a1d7-3b69c80031e7', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/04992d9e9eba463f9b5d8143e4d955b26361482647d2f85045533d066aa11142.webp', 'Fanny Bag — Midnight Blue, detail view MB3', 3),
('aadcb8c5-9081-41c2-a8b7-5707e991469c', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/5e5506e96799e63fbe71893269e6607676689fd3b15db514d5a2ab503da7b2df.webp', 'Fanny Bag — Midnight Blue, detail view MB4', 4),
('7766bc3f-0eb1-4db8-afcf-2aa4bd4fea9b', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/15c56fbe2e6a553ea32065d2d6f818a636e613e691ca45eb82ba35b535b2b91c.webp', 'Fanny Bag — Midnight Blue, detail view MB5', 5),
('43504827-3754-4e76-adc1-2781dd77eadb', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/b5eb14f59c96292fe25d7db5e5911823c343f2e63f4e695f1a6a60e2ba69bfbb.webp', 'Fanny Bag — Midnight Blue, dimension guide', 6)
) as source(id, url, alt, position)
join products p on p.slug = 'fanny-bag-midnight-blue'
where not exists (select 1 from product_media existing where existing.product_id = p.id and existing.url = source.url)
on conflict do nothing;

insert into product_media (id, product_id, url, alt, position)
select source.id::uuid, p.id, source.url, source.alt, source.position
from (values
('39fef897-a9c2-4a49-a696-12b2f0a3347c', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/b117501dccaa499f0818e2dd19e40a75c412536ac694c825ab73697056168dee.webp', 'Heavy Duty Grocery Bag — Long, main view', 0),
('07790872-8dfa-43aa-a204-a5b604a1ef37', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/e1675620b16b446b10c29c9bc64e1253b71b6a17d62eadfcf58cc1893855438b.webp', 'Heavy Duty Grocery Bag — Long, detail view 1', 1),
('05169d2b-b671-40d6-a808-3c5b951456c1', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/63e8a217b65219628d0a4811cb8bb77bff9a3560ecde76897180640e69bdc264.webp', 'Heavy Duty Grocery Bag — Long, detail view 2', 2),
('9da3a38b-9796-4de4-a4ca-07c61a9bae2b', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/4745b6aec9c96351061dacf0964e5f3a91842f1ef2b73d5c961489f7229766c4.webp', 'Heavy Duty Grocery Bag — Long, detail view 3', 3),
('df25ca5b-e2d4-41f5-a3ed-afe910e7508b', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/12faaa7722ecb19244e5121b83ac80f2c6ea655dada8cc10cf071ffef252aedd.webp', 'Heavy Duty Grocery Bag — Long, detail view 4', 4),
('aa5b1947-a36c-437a-a84a-d4bc389741e6', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/186d06e042b8e7c5442c8b373da7f1f57d15afa86d72c4de0907549e404cfeb1.webp', 'Heavy Duty Grocery Bag — Long, interior view', 5),
('ad7b1e82-9197-4f9f-a34e-7fb4ba8e7a24', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/21c204b7f14fd3c71f222e4b7d0c6cf9743da77b5a5c3a24f891033159571420.webp', 'Heavy Duty Grocery Bag — Long, dimension guide', 6)
) as source(id, url, alt, position)
join products p on p.slug = 'heavy-duty-grocery-bag-long'
where not exists (select 1 from product_media existing where existing.product_id = p.id and existing.url = source.url)
on conflict do nothing;

insert into product_media (id, product_id, url, alt, position)
select source.id::uuid, p.id, source.url, source.alt, source.position
from (values
('1d624565-6ec0-4e30-a421-eff58a8bca41', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/04dc001447dbe3d89d8abe460b398bb4de4a8370d55201d4b7773582cbe2f89d.webp', 'Heavy Duty Grocery Bag — Square, main view', 0),
('5dee2f0b-e882-4c39-a1b7-c48142dbbc4e', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/0a17d6b2f7f459e8d645bf6a27dc0631cf363b6fb6305bf9b0cd8a0c6740ad71.webp', 'Heavy Duty Grocery Bag — Square, detail view 1', 1),
('1d7045aa-1c4e-4785-ad1f-c1c46c3cfb30', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/186d06e042b8e7c5442c8b373da7f1f57d15afa86d72c4de0907549e404cfeb1.webp', 'Heavy Duty Grocery Bag — Square, detail view 2', 2),
('07676ee5-5233-465f-a561-69453a1e8ed9', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/5a7bea2d622f6e25828f2b498de3798e7ca61dc11621d8172750899d786fbc19.webp', 'Heavy Duty Grocery Bag — Square, detail view 3', 3),
('3ceb9c98-51db-4e76-af87-2ebc05d55d9f', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/780f2c65a598b90a68ce515d9fa32c806859f7805d65d5bb48c9b0a158301b13.webp', 'Heavy Duty Grocery Bag — Square, detail view 4', 4),
('628c0067-cebc-41d2-a0f7-6cd3f1abf94c', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/182383ca11a06b79f29fe05f97d9475b62c806d30be3b9e3b015b48ad038f1c2.webp', 'Heavy Duty Grocery Bag — Square, detail view 5', 5),
('124261a9-3b23-487d-ae2e-83766b5bc31f', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/a936eb71adbb1dc3aac65de373c442f29d5b1dd72b8f7efbae56929f89ba5de6.webp', 'Heavy Duty Grocery Bag — Square, dimension guide', 6)
) as source(id, url, alt, position)
join products p on p.slug = 'heavy-duty-grocery-bag-square'
where not exists (select 1 from product_media existing where existing.product_id = p.id and existing.url = source.url)
on conflict do nothing;

insert into product_media (id, product_id, url, alt, position)
select source.id::uuid, p.id, source.url, source.alt, source.position
from (values
('8b2af422-5c66-4b77-a60b-641f26b909ce', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/d9b5c6ec14c11707365fa452cf5d39649c2fcadadc0aa3422a339852ddb4b228.webp', 'Sling Bag — Nevada Red, main view', 0),
('13c18c04-bbf3-48bf-ae0f-0b7c5b56552f', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/08d5b738945523e51b687ce847e89aaf6d09b5f77d30590ca2debe04b29f8ecd.webp', 'Sling Bag — Nevada Red, detail view 1', 1),
('a733aa82-dabe-4a34-a9ac-d7cdb4381b61', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/07c9747f299d5d175684bacec6d218abe16e587064d0cd503989e4009f8bb8d1.webp', 'Sling Bag — Nevada Red, detail view 2', 2),
('4993bbc6-e54a-4645-a592-992aed6bc307', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/570719cb4118725fdcd34ac0d79f3a524399ef9f797418a6ab096c4965cea852.webp', 'Sling Bag — Nevada Red, detail view 3', 3),
('4f675964-c96d-4673-ad4a-7c155f9912fe', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/bfc42b3b4d038d9d9af6e67b26e4a0b5bce68de6ef13ea1be3367da977527cd9.webp', 'Sling Bag — Nevada Red, detail view 4', 4),
('181ecffb-e28f-4289-a876-35f283ba4b0e', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/b6cc572419bea693b27fa024261a4b7584b63adb904e29172b8e65219c0c35fc.webp', 'Sling Bag — Nevada Red, detail view 5', 5),
('02dc72bf-9a2f-4498-a891-719802ae2ecd', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/401a79e2d55a702cf866a9748aaefffcc13654d1f1638a94a25c68455b5fbf53.webp', 'Sling Bag — Nevada Red, dimension guide', 6)
) as source(id, url, alt, position)
join products p on p.slug = 'sling-bag-nevada-red'
where not exists (select 1 from product_media existing where existing.product_id = p.id and existing.url = source.url)
on conflict do nothing;

insert into product_media (id, product_id, url, alt, position)
select source.id::uuid, p.id, source.url, source.alt, source.position
from (values
('1dd1bcc1-9854-4192-ac15-b10d22bcc723', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/65c5ca0cf0d1a4129fb354872c6f2b3e5d7244d5483f922b2163ec6b9678834d.webp', 'Sling Bag — Tuscan Green, main view', 0),
('7cda38f3-6c8d-489f-a936-c85923c366aa', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/d290e1c34f1f55fec8ba18d8d2451819bfdf5aeb34153946ac97edb03a44ac71.webp', 'Sling Bag — Tuscan Green, detail view 1', 1),
('e1ed411c-437e-43cb-ad44-6dd5c64f16c0', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/0876355a5631743892139bc0ad44edbaeb8ca7631fa2a59953cae3ef974b0a77.webp', 'Sling Bag — Tuscan Green, detail view 2', 2),
('265fc0f6-64c0-41be-a026-710144626719', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/02cc5b22d4c9c7c766860164b925df2dc60a7bf0f6fd1c5728f68ee97c144c51.webp', 'Sling Bag — Tuscan Green, detail view 3', 3),
('cf150e19-b042-46a4-ac8e-b2d70ac48bcf', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/9bd97008f67dec61ec3c936ea8bb8633ab2185cda23423aed6e06911c00f6224.webp', 'Sling Bag — Tuscan Green, detail view 4', 4),
('fdc97df9-bab3-4bf7-a9c8-c6cc9a3ee41a', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/f0f26a8cfa699f1875886d6109dc3f1c83c3c3a4c03616c7b2fbbbac3658f8e5.webp', 'Sling Bag — Tuscan Green, detail view 5', 5),
('ccc6b17d-9491-412a-ac3b-cdd222232dd8', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/09f9651eddedb53ef1c91e5a239c777bcb2c49ac9439ff8218332e8e6d7f5b95.webp', 'Sling Bag — Tuscan Green, dimension guide', 6)
) as source(id, url, alt, position)
join products p on p.slug = 'sling-bag-tuscan-green'
where not exists (select 1 from product_media existing where existing.product_id = p.id and existing.url = source.url)
on conflict do nothing;

insert into product_media (id, product_id, url, alt, position)
select source.id::uuid, p.id, source.url, source.alt, source.position
from (values
('477db61f-ccd7-4dc2-af0c-30bbb4190f48', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/ba03c5688e1d3e99d25efa73ad52845f26969fec226d97abc5ecf3e1ec73c1d5.webp', 'Tote Bag — Green Wave, main view', 0),
('e5b10f54-ed51-4fe7-a3ee-42adabd9e12c', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/f81ea361f13978d5dc41c651f4364107ff9206102369845ccd06cdfe42cd2047.webp', 'Tote Bag — Green Wave, detail view 1', 1),
('f1fdad63-5088-46de-a27c-f9ce0b419deb', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/9d5a23131eb5c2d03894d5274a437612ea9d703777a68c88a6d94c51f3cb1c5a.webp', 'Tote Bag — Green Wave, detail view 2', 2),
('4c2ad217-8c45-4949-aa08-7a1905baf912', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/ebdf9c8ae32a28cc4dd26beec00626467a5e567cd1bca7b2d1f97db43b8e1985.webp', 'Tote Bag — Green Wave, detail view 3', 3),
('4930e55e-4b12-48f0-ad58-c5384bfd7858', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/736d918e65bbcfb5783b4d3e6e206461fb9a75748cfcfffa97c69665cbc90ead.webp', 'Tote Bag — Green Wave, detail view 4', 4),
('8618387a-5116-4711-aa1c-d912e81c8c98', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/a6a8443ca107ee6556c9d478adb0963216df603a1865b66867eee47c196d067a.webp', 'Tote Bag — Green Wave, detail view 5', 5),
('c7d6576c-8cd4-4394-a3d8-a2341135e7b0', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/cbd3e200de55a7dd9e068ba6f09f3543482a124672d4b92715af1b4ad4389c29.webp', 'Tote Bag — Green Wave, dimension guide', 6)
) as source(id, url, alt, position)
join products p on p.slug = 'tote-bag-green-wave'
where not exists (select 1 from product_media existing where existing.product_id = p.id and existing.url = source.url)
on conflict do nothing;

insert into product_media (id, product_id, url, alt, position)
select source.id::uuid, p.id, source.url, source.alt, source.position
from (values
('db5c11d1-f85f-41e2-ada4-72a9089f280e', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/5d9127441e461394229c9324113e6f99964d9707acec34e2a7c259702fc8fcd6.webp', 'Tote Bag — Orange Wave, main view', 0),
('db629ee8-4385-4acd-a0b5-09d4e6bb10c4', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/96c696c5b459eea7aaecaa13f7cd1850f418a12c4ec9bcdc98b46169fd5002d2.webp', 'Tote Bag — Orange Wave, detail view 1', 1),
('819403d2-c8a6-4ccb-adad-058dc81364c5', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/f81ea361f13978d5dc41c651f4364107ff9206102369845ccd06cdfe42cd2047.webp', 'Tote Bag — Orange Wave, detail view 2', 2),
('f9781d60-ccb3-4ee5-adc3-ee5c890afc16', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/704f9c1ed618454d6026ff47ee567b540d6ac41e9c461602942bd7330a5b271e.webp', 'Tote Bag — Orange Wave, detail view 3', 3),
('4f73d9f8-e580-47cf-a687-b028b0b60f02', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/da03892469a9db274447d914e36acc3e02a44928c906243ed9910147fbf059e5.webp', 'Tote Bag — Orange Wave, detail view 4', 4),
('4bdc577f-0003-4872-a48e-47ebfe9c556c', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/15fa131e411e41778e72d958085434f6776ff76f706b404d269edbec5fb08e9a.webp', 'Tote Bag — Orange Wave, detail view 5', 5),
('f122c6b5-08bf-4442-a092-69d8c0f92017', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/020362f1b1ea169f42096bf3c59374521c70e5edc18e015bca9bfbf13abdf2a7.webp', 'Tote Bag — Orange Wave, detail view 6', 6),
('8d71b5c5-f724-403a-a2b4-7031abefe8aa', 'https://ik.imagekit.io/7w1lv8vah/noksa/catalog/75d6c5cae793a169e80a665cf5878f83c46d33a6c05ab9c90070e4f4a9ec8a6e.webp', 'Tote Bag — Orange Wave, dimension guide', 7)
) as source(id, url, alt, position)
join products p on p.slug = 'tote-bag-orange-wave'
where not exists (select 1 from product_media existing where existing.product_id = p.id and existing.url = source.url)
on conflict do nothing;

insert into product_collections (product_id, collection_id)
select p.id, c.id from (values
('heavy-duty-grocery-bag-long', 'grocery-bags'),
('tote-bag-green-wave', 'tote-bags'),
('sling-bag-nevada-red', 'sling-bags'),
('tote-bag-orange-wave', 'tote-bags'),
('heavy-duty-grocery-bag-square', 'grocery-bags'),
('fanny-bag-midnight-blue', 'fanny-bags'),
('fanny-bag-desert-sand', 'fanny-bags'),
('sling-bag-tuscan-green', 'sling-bags')
) as source(slug, handle)
join products p on p.slug = source.slug
join collections c on c.handle = source.handle
on conflict do nothing;
