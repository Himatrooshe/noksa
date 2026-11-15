# Drive catalog import

Source: [All Products](https://drive.google.com/drive/folders/1qi579DnHJJ1rP3Bq3gC2yWsPKHKvVdTG?usp=sharing).

Eight products were created in the configured catalog database as drafts. Each has a description, dimensions transcribed from its size image, descriptive image alt text, a main cover image, and one default inventory variant.

| Collection | Product | Gallery images |
| --- | --- | ---: |
| Fanny bags | Fanny Bag — Desert Sand | 7 |
| Fanny bags | Fanny Bag — Midnight Blue | 7 |
| Grocery bags | Heavy Duty Grocery Bag — Long | 7 |
| Grocery bags | Heavy Duty Grocery Bag — Square | 7 |
| Sling bags | Sling Bag — Nevada Red | 7 |
| Sling bags | Sling Bag — Tuscan Green | 7 |
| Tote bags | Tote Bag — Green Wave | 7 |
| Tote bags | Tote Bag — Orange Wave | 8 |

All 58 supplied photos were used: 57 product gallery images plus the grocery collection cover showing both shapes. The other three collections use a representative product cover. Images were downloaded and converted to WebP; viewing them does not depend on continued Drive sharing.

The images have since been migrated to ImageKit: 61 product/collection references now point to 56 unique uploaded files (identical images are shared). Every uploaded original was verified by SHA-256 before changing database URLs. No embedded product or collection images remain. An ignored rollback snapshot and the upload-ID checkpoint are retained under `backups/imagekit-migration/`. See [image storage](IMAGE_STORAGE.md) for configuration and migration commands.

After the import, the owner authorized publication, stock of 10 per product, provisional prices, and USD for the US market. All eight products are now Active, with inventory tracking enabled and overselling disabled (80 units total).

| Products | Provisional USD price |
| --- | ---: |
| Fanny bags, both colors | $29.00 each |
| Grocery bag, Long | $22.00 |
| Grocery bag, Square | $24.00 |
| Sling bags, both colors | $24.00 each |
| Tote bags, both colors | $32.00 each |

Prices are provisional merchandising values selected at the owner's request, not currency conversions or cost-based recommendations. The database stores whole dollars; the shared price formatter displays USD with two decimal places. Existing orders were checked and the table was empty before the currency change.

The fanny bag parent folder says “Ocean blue,” but its actual color subfolder says “Midnight blue.” The imported product follows the subfolder name. The Read me.txt download was empty. No load-capacity claims were added from promotional image text.

Verification: the import transaction completed, and database read-back confirmed all eight products, populated descriptions and dimensions, their gallery counts, and default variants. A subsequent publication transaction was verified by reading back every product's Active status, assigned price, and stock of 10. Existing collections were retained. `npm run typecheck` and `npm run build` passed for the USD display changes.
