# Shopify Admin Catalog Management (Product list, Inventory, Collections, Files) — as of Nov 2026

Context: a single-owner handmade jute-goods store with about 10-100 products, BDT pricing, and probably one location. Priority tags: **P0** must-have, **P1** nice-to-have, **P2** skip for now.

Research note: Shopify moved several Help Center pages. Inventory docs now partly live under `/manual/inventory-and-locations/...`. Some fetched pages only returned tables of contents, and those cases are marked as gaps below.

---

## Product list (Products index page): columns, search, filters, saved views, sorting, bulk actions, CSV, pagination

### Takeaway
The Products index is a paginated table with 50 products per page. Merchants can choose which columns show and in what order, sort by 7 keys, search across title, description and tags with field syntax, and use about 15 filter types. There are 4 fixed views (All/Active/Draft/Archived) plus custom saved views, a checkbox bulk-action bar that opens a spreadsheet-like bulk editor, and CSV import and export. In April 2026, search, filters and saved views were merged into one bar. That date comes from a third-party source.

### Cited Findings
**Pagination and columns**
- "A list of 50 products are listed on each page." — [Shopify Help: View and sort products](https://help.shopify.com/manual/products/view-sort-products)
- Columns can be customized through the layout icon > **Columns** section. Merchants can drag columns to reorder them and show or hide each one. The **All** view has a **Hide archived** toggle. The help page does not list the default column set. — [View and sort products](https://help.shopify.com/manual/products/view-sort-products)

**Sorting (7 options)**
- The 7 sort options:
  - Product title A-Z or Z-A
  - Created, newest or oldest. This is the **default**.
  - Updated, newest or oldest
  - Inventory, ascending or descending
  - Product type A-Z or Z-A
  - Publishing date, ascending or descending
  - Vendor A-Z or Z-A

  Clicking the triangle in a column header reverses the order. — [View and sort products](https://help.shopify.com/manual/products/view-sort-products)
- Sort changes are not saved into a saved view. — [Searching and filtering](https://help.shopify.com/manual/products/searching-filtering)

**Search**
- Basic search covers "product titles, descriptions, or tags".
- Advanced syntax includes `title:ani*` (prefix wildcard), `tag:new`, boolean `AND NOT`, and `metafields.custom.material:silk`.
- Limitation: Shopify cannot search for "a specific partial set of characters in the middle or end of a word".

  — [Searching and filtering](https://help.shopify.com/manual/products/searching-filtering)

**Filters**
- Available filters:
  - Vendors, Tags, Statuses (active/draft/archived), Categories (standard taxonomy), Types, Collection
  - Sales channel and Region catalog (markets)
  - B2B catalog, Company location catalog, Retail catalog, Unassigned catalog
  - Publishing error, Gift card, Combined listings
  - Metafields, which must be activated per definition

  When several filters are applied, they combine with AND: "only the products that match all of the conditions are displayed." — [Searching and filtering](https://help.shopify.com/manual/products/searching-filtering)
- A 2026 third-party write-up says commas give OR conditions inside a filter and the spacebar opens filters. — [Pasilobus blog, Apr 24 2026](https://www.pasilobus.com/blogs/articles/shopify-just-made-admin-search-and-filters-actually-useful)

**Saved views**
- The default views All, Active, Draft and Archived cannot be edited.
- Custom views are created with filters → Save → name. They can be renamed or re-filtered, and deleted, which is irreversible. Views can only be saved on desktop.

  — [Searching and filtering](https://help.shopify.com/manual/products/searching-filtering)
- History: the admin-wide filter and saved-view redesign shipped **Dec 20, 2022** on Products, Orders, Inventory, Collections and other pages. Search opens with the **F** key. — [Shopify Changelog](https://changelog.shopify.com/posts/index-filtering-search-redesign)
- **Recent change (Apr 2026):** "Search, filters and saved views were combined into one bar on the Orders, Products, Customers, Discounts, Collections and Metaobjects pages". The same article says Sidekick (the AI assistant) can apply filters conversationally. — [Pasilobus blog (Shopify app developer, not an official changelog)](https://www.pasilobus.com/blogs/articles/shopify-just-made-admin-search-and-filters-actually-useful)

**Bulk selection and bulk editor**
- Merchants can "select some or all of the products and perform bulk actions on them" in any view, including filtered or searched views. — [View and sort products](https://help.shopify.com/manual/products/view-sort-products)
- Bulk editor:
  - Select rows with checkboxes on Products, Collections, Inventory or Customers, then click **Bulk edit**.
  - It opens a spreadsheet-like table with one column per property (price, SKU, compare-at price and so on). The **Columns** button adds or removes properties.
  - Large edits take longer.
  - Barcodes are limited to 20 per variant.

  — [Shopify Help: Bulk editing](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/bulk-editing)
- Shopify's example uses of the bulk editor are "adjusting prices or changing sales channel visibility". — [Shopify Help: Bulk actions](https://help.shopify.com/en/manual/products/bulk-actions)
- A search snippet describes a "compact bulk action bar" with set active, draft or archived. The snippet came from a search summary, and it is unclear whether it describes Shopify or a third party, so the full action-bar list is under Gaps.

**CSV import and export**
- Required columns: **Title** for new products, and **URL handle** for updates and variants.
- Common columns: Price, Compare-at price, Inventory quantity, Vendor, Description, Tags, Product category, Type, Status, SKU, Option1 name/value, Weight, Product image URL, Image alt text, SEO title, SEO description, and metafields. There are also per-market price and inclusion columns.

  — [Shopify Help: Using CSV](https://help.shopify.com/en/manual/products/import-export/using-csv)
- When **"Overwrite products with matching handles"** is checked, a blank non-required cell overwrites the existing value with a blank. Columns left out of the file keep their values. — [Using CSV](https://help.shopify.com/en/manual/products/import-export/using-csv)
- CSV does not cover:
  - variant metafields
  - product deletions
  - availability on non-primary sales channels
  - collections on export (collections are import-only)

  Images must be public HTTPS URLs, with up to 250 per product, and video or 3D media is not supported. — [Using CSV](https://help.shopify.com/en/manual/products/import-export/using-csv)

### Inferences (priority for the jute store)
- **P0**:
  - Table with thumbnail, title, status badge, inventory summary (for example "12 in stock" or "Not tracked"), product type/category and price
  - Simple text search on title, tags and SKU
  - Status tabs: All / Active / Draft / Archived
  - Checkbox multi-select with bulk set Active, set Draft, Archive and Delete (with confirmation)
- **P1**:
  - Filters for type/category, tag, collection and stock level (in stock / low / out)
  - Sort by created, updated, title and inventory
  - Bulk add/remove tags and bulk add to collection
  - CSV export as a backup or for editing in a spreadsheet
  - Pagination of 25-50 rows. With ≤100 products, client-side filtering of everything is fine.
- **P2**:
  - Custom saved views
  - Column reordering
  - Advanced query syntax
  - Metafield filters
  - Market, B2B and catalog filters
  - Vendor (single maker)
  - Full spreadsheet bulk editor (an inline price/stock edit is a cheaper substitute)
  - CSV *import* with overwrite semantics. This is P1 at most, and only for the first catalog load.
- Recommended default sort: newest first, which matches Shopify.

### Gaps
- No Shopify primary source fetched gave the exact list of actions in the product-list bulk-action bar. From general knowledge (not verified), it includes set active, set draft, archive, delete, add/remove tags, add/remove from collection, and include/exclude sales channels or markets. Treat this as unverified.
- No help page lists the default visible columns. Commonly seen columns are Product (thumbnail + title), Status, Inventory, Sales channels, Markets, Category, Type and Vendor (not verified).
- The April 2026 unified search bar is confirmed only by a third-party blog. No official changelog post was found.
- The export dialog options (current page / all / selected / matching search; CSV for Excel vs plain CSV) were not confirmed from a primary source in this session.

---

## Inventory screen: viewing and adjusting stock, inline edits, adjustment history and reasons, low stock

### Takeaway
Products > Inventory lists variants per location. Each variant has inventory states (On hand = Committed + Unavailable + Available; Incoming is tracked separately). Available and On hand can be edited inline in "Set to" or "Adjust by" mode. Edits are staged as pending changes and saved in one batch. Every adjustment is logged, and the per-variant history covers 180 days with preset reasons. Low-stock alerts are not built into the Inventory page. Merchants sort and filter by stock or use Shopify Flow.

### Cited Findings
**Inventory states**
- On hand = Committed + Unavailable + Available.
- Committed covers unfulfilled orders, draft orders and ready-to-ship transfers.
- Unavailable covers damaged, quality control, safety stock or app holds.
- Incoming is stock on its way from transfers or purchase orders, and it cannot be sold.
- Editing On hand changes Available by the same amount, and the reverse.

  — [Shopify Help: Inventory states](https://help.shopify.com/en/manual/products/inventory/managing-inventory-quantities/inventory-states)
- **Recent change (Aug 2026):** draft-order and transfer/shipment inventory moved from a "reserved" representation to "committed". This comes from a search-result summary of the developer changelog and was not fetched directly. — [shopify.dev changelog](https://shopify.dev/changelog/release-notes/2026-07.md)

**Inline editing workflow**
- Steps:
  1. Go to Products > Inventory.
  2. Pick a location.
  3. Click an Available or On hand cell.
  4. Choose **Set to** (useful after a physical count) or **Adjust by** (+/−).
  5. Optionally add a reason through the note icon.
  6. Click the checkmark to mark the change as pending.
  7. Review the pending changes and click **Save**. Leaving the page discards unsaved changes.

  Columns include Product, SKU, Available, On hand, and Unavailable sub-states (Damaged, Quality control, Safety stock, Other). — [Shopify Help: Change quantities by product](https://help.shopify.com/en/manual/locations/changing-quantities/change-quantities-by-product)
- **Recent change (May 7, 2026):** the adjustment popover gained two modes. **Set To** records the change automatically. **Adjust By** requires choosing a source and destination, for example moving stock between states. History captures "the source, destination, who made the change, and when". The **Bulk Editor is unchanged** and still edits quantities directly. — [Shopify Changelog](https://changelog.shopify.com/posts/inventory-adjustment-workflow-now-with-full-change-tracking)
- Inventory bulk editor:
  - Click **Columns**, pick each location, and edit quantities spreadsheet-style.
  - Variants of the same product may not appear grouped together.

  — [Shopify Help: Bulk editing](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/bulk-editing); [Bulk editing inventory](https://help.shopify.com/manual/products/inventory/managing-inventory-quantities/bulk-editing-inventory)
- Inventory quantities can be imported and exported by CSV from the Inventory page. — [Shopify Help: Inventory](https://help.shopify.com/en/manual/products/inventory/getting-started-with-inventory/view-inventory)

**Adjustment history**
- Columns: Date, Activity (the trigger), Created by (staff, app or channel), Unavailable, Committed, Available, On hand, Incoming. Each cell shows "the adjusted quantity first, and the new total quantity second."
- Only the **last 180 days** are visible per product or variant. Older changes are in the "Inventory adjustment changes" report.
- To view it: Product → (variant) → Inventory tracked → **View adjustment history**.

  — [Shopify Help: Adjustment history](https://help.shopify.com/en/manual/inventory-and-locations/adjusting-inventory/adjustment-history)
- Manual reasons with "Set to":
  - Correction
  - Count
  - Received
  - Return restock
  - Damaged
  - Theft or loss
  - Promotion or donation

  — [Adjustment history](https://help.shopify.com/en/manual/inventory-and-locations/adjusting-inventory/adjustment-history)

**Low stock**
- Shopify has no built-in low-stock threshold or alert on the Inventory page.
- The manual approach is to open Products > Inventory, filter or sort by available quantity ascending, and check Available and Committed.
- The automated route is Shopify Flow, which is free on paid plans, with the "Inventory quantity changed" trigger plus a threshold condition, and then an email. It sends one email per product, not a digest.

  — [notify-me.io guide (third-party)](https://notify-me.io/post/how-to-add-low-stock-alerts-on-shopify)

### Inferences (priority for the jute store)
- **P0**:
  - Per-product or per-variant `stock` (Available), with a "track inventory" on/off flag
  - Inline "Set to" edit from the inventory list or product list
  - Stock decremented automatically when an order is placed
- **P1**:
  - Stock-movement log table: who/when, delta, new total and a reason enum. Shopify's 7 reasons are a good ready-made list. A simple append-only `inventory_adjustments` table is cheap and helps debugging.
  - "Adjust by ±N" mode
  - A "Committed" count derived from unfulfilled orders, so Available = On hand − Committed
  - Low-stock threshold per product (or global), with a highlighted badge and a "Low stock" filter. An email alert is optional. This would *exceed* Shopify's native UI, and it is cheap at this scale.
- **P2**:
  - Multiple locations
  - Unavailable sub-states (damaged/QC/safety stock)
  - Incoming
  - Inventory CSV
  - The batched pending-changes save model. Immediate save per cell is fine for one owner.
- Handmade goods are often made to order. Consider a per-product "continue selling when out of stock / made to order" flag. Shopify has an equivalent per variant, which belongs to the product-form researcher's scope.

### Gaps
- No primary source was found for the default Inventory page filters and sort keys beyond the location picker.
- The retention period of the "Inventory adjustment changes" report and its plan availability were not verified.

---

## Collections: manual vs automated, conditions, fields, sort order, product assignment

### Takeaway
A collection can be **manual**, with hand-picked products or variants, or **automated (smart)**, with rule-based inclusion conditions matched by "all" or "any". Newer Shopify also supports exclusion conditions and multiple sources per collection. Fields are title, description, image, SEO and a default product sort order (6 options, including Manual drag-and-drop).

### Cited Findings
- Products can be added automatically through inclusion conditions or manually by selecting products or **variants**. Exclusion can also be automatic or manual.
- A collection can combine sources: own products or variants, third-party app products, and another existing collection.

  — [Shopify Help: Collections](https://help.shopify.com/en/manual/products/collections)
- Automated condition fields and operators:
  - Product or Variant title, Type, Vendor: is equal to, is not equal to, starts with, ends with, contains, does not contain
  - Product category: is / is not equal to, with an "Include subcategories" option
  - Tags: includes / does not include
  - Status: is / is not equal to
  - Price, Compare-at price, Weight, Inventory stock: =, ≠, >, <. Compare-at price also has "is set" and "is not set".
  - Metafields, by type: boolean, integer, decimal, rating, single-line text, metaobject reference

  — [Shopify Help: Automated collection conditions](https://help.shopify.com/en/manual/products/collections/automated-collections/auto-select)
- Matching works by **Match all conditions** or **Match any condition**.
- Limits:
  - up to 60 condition values per Products or Variants source
  - at most 10 sources per collection
  - up to 128 product and 128 variant metafield definitions usable as conditions
- Only category, tag, type and vendor support exclusions. Status cannot exclude.

  — [Automated collection conditions](https://help.shopify.com/en/manual/products/collections/automated-collections/auto-select)
- Sort orders:
  - Most relevant (by sales performance)
  - Best selling (all-time orders)
  - Alphabetical A-Z or Z-A
  - Price high or low
  - Date old or new (created)
  - **Manual** (drag to rearrange)

  The documented editable fields are Name/title, Description and Featured image. — [Shopify Help: Collection layout](https://help.shopify.com/en/manual/products/collections/collection-layout)
- The Collections index has the same filter/saved-view system: the 2022 redesign and the April 2026 unified bar. — [Shopify Changelog](https://changelog.shopify.com/posts/index-filtering-search-redesign); [Pasilobus](https://www.pasilobus.com/blogs/articles/shopify-just-made-admin-search-and-filters-actually-useful)
- The bulk editor is also reachable from the Collections index. — [Bulk editing](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/bulk-editing)

### Inferences (priority for the jute store)
- **P0**:
  - Manual collections, such as "Bags", "Home décor", "Baskets" or "Gifts", with title, slug/handle, description, image and an active/hidden flag
  - Many-to-many product↔collection mapping
  - Assign collections from the product form and from a picker on the collection page
- **P1**:
  - Manual drag ordering of products within a collection
  - Sort-order presets (newest, price ↑/↓, A-Z, best-selling)
  - SEO title and meta description
  - Simple tag-based "smart" rules (tag includes X, or price < N BDT, or in stock), with all/any matching
- **P2**:
  - Variant-level membership
  - Multiple sources
  - Exclusion rules
  - Metafield conditions
  - Category taxonomy conditions
  - Weight conditions
  - The 60-condition limit is irrelevant at this scale.
- At this scale, tags + manual collections are enough. Automated collections are mainly useful for "Sale" (compare-at price is set) and "New arrivals" (sort by date).

### Gaps
- No fetched page showed the SEO fields, theme template selection or sales-channel publishing for collections, or a collection count limit.
- I did not confirm whether a collection's type can be switched between manual and automated after creation. Historically it could not, but this is unverified for 2026.

---

## Files / media library (Content > Files)

### Takeaway
Content > Files is a central store-wide library for images, video, 3D and generic files. Files can be reused in product media, brand assets and metaobjects. It supports alt text, file replacement, focal points, folders, filtering and bulk delete. Images can be up to 20 MB and 25 MP, and video up to 1 GB and 10 min.

### Cited Findings
- File types:
  - Images: JPEG, PNG, WEBP, HEIC, GIF
  - Video: MOV, MP4, WEBM
  - Generic: any format except HTML
- Trial plans are restricted.

  — [Shopify Help: Files](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/file-uploads)
- Limits:
  - Images: 20 MB, 25 megapixels, aspect ratio between 100:1 and 1:100
  - Video: 1 GB, 10 min, 100-4096 px, 120 fps
  - Generic files: 20 MB
  - Video and 3D count: 250-100,000 per store depending on plan
  - Storage: 100 GB (Starter/Basic) up to 10 TB (Enterprise)

  — [Shopify Help: Files](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/file-uploads)
- Files can be "used across your Shopify admin, including as brand images, product media, and metaobjects". — [Shopify Help: Files](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/file-uploads)
- Editor features: alt text, renaming via URL handle, replacing the file, focal point, and video cover. The list can be filtered by name, type, size and **usage**. Merchants can **create folders** and bulk delete. — [Shopify Help: Files](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/file-uploads)
- A product supports up to 250 images, which is the per-product image limit for CSV import. Files hosted in Shopify Files can be referenced by URL in CSV. — [Using CSV](https://help.shopify.com/en/manual/products/import-export/using-csv)

### Inferences (priority for the jute store)
- **P0**:
  - Image upload (JPEG/PNG/WEBP) attached to products, with alt text
  - Reorder product images, with the first image as the thumbnail
  - Server-side resizing and WEBP conversion, since phone photos of jute products are large
  - A size cap of about 10-20 MB per image
- **P1**:
  - A central media library page: grid of all uploads, "used in" indicator, pick an existing image when editing a product or collection, delete only if unused
  - Alt-text editing
  - Replace file
- **P2**:
  - Video
  - 3D
  - Generic file hosting
  - Folders
  - Focal points
  - HEIC (or convert on upload)
- The "usage" filter is Shopify's way of finding orphan files. A `used_count` or join query gives the same result cheaply.

### Gaps
- The date when folders were added to Files was not determined. It may be a 2025-2026 addition, so verify against the changelog if it matters.
- The image count limit per store was not found. Only video and 3D counts are capped by plan.

---

## Gift cards, purchase orders, transfers

### Takeaway
All three exist in Shopify admin. Gift cards are a special product type and can also be issued directly. Purchase orders (Products > Purchase orders) record supplier orders and, recently, create transfers when received. Transfers (Products > Transfers) move or receive stock between locations. A single-location handmade store does not need POs or transfers. Gift cards are optional.

### Cited Findings
- Gift card products can be activated for sale, or gift cards can be issued from the admin. Physical cards for POS are sold through the Hardware Store in some regions. Merchants must accept the gift card terms of service. — [Shopify Help: Gift card products](https://help.shopify.com/en/manual/products/gift-card-products)
- The product list has a "Gift card" filter, and CSV has a gift card column. — [Searching and filtering](https://help.shopify.com/manual/products/searching-filtering); [Using CSV](https://help.shopify.com/en/manual/products/import-export/using-csv)
- 2026 developer release notes mention gift card expiration settings. This comes from a search-result summary and was not fetched. — [shopify.dev release notes 2026-01](https://shopify.dev/changelog/release-notes/2026-01)
- Purchase orders record "products, quantities, costs, payment terms, and supplier details". They are created at Products > Purchase orders and received with **Receive inventory**. — [Shopify Help: Purchase orders](https://help.shopify.com/manual/products/inventory/purchase-orders)
- **Recent change:** "purchase orders now create transfers". Each PO links to a transfer that tracks shipment and receiving. — [Shopify Changelog](https://changelog.shopify.com/posts/purchase-orders-now-create-transfers-to-move-inventory)
- Transfers record, track and receive inventory between locations or from suppliers. They are created at Products > Transfers > Add transfer. — [Shopify Help: Transfers](https://help.shopify.com/manual/products/inventory/transfers)
- Other changelog items include "greater flexibility for inventory transfers" (not fetched) and API support in 2026 for transfer metafields and a CANCELED shipment receive action. — [Changelog: transfers](https://changelog.shopify.com/posts/greater-flexibility-for-inventory-transfers); [shopify.dev 2026-07 notes](https://shopify.dev/changelog/release-notes/2026-07.md)

### Inferences (priority for the jute store)
- **Gift cards: P2.** They need balance tracking, codes and redemption at checkout. A discount code covers most gifting needs in BDT.
- **Purchase orders: P2.** A single maker or supplier can log raw-jute or batch arrivals as "Received" stock adjustments with a note.
- **Transfers: P2.** These only apply with multiple locations.

### Gaps
- The exact dates of the PO→transfer change and the "greater flexibility for transfers" change were not captured.

---

## Essential vs advanced: overall priority summary for a small single-owner store

### Takeaway
Most of Shopify's catalog complexity serves multi-location, multi-market, multi-staff or B2B merchants. The essential core for 10-100 handmade products is:
- a searchable product table with status tabs and basic bulk status actions
- a simple stock view with inline set and adjust, a reasons log and a low-stock flag
- manual collections with ordering
- image uploads with reuse

### Cited Findings
- Complexity drivers seen in this research, which a single-location, single-market, single-owner store can skip:
  - B2B/catalog/market filters ([Searching and filtering](https://help.shopify.com/manual/products/searching-filtering))
  - multi-location columns and unavailable sub-states ([Change quantities](https://help.shopify.com/en/manual/locations/changing-quantities/change-quantities-by-product))
  - per-market CSV columns ([Using CSV](https://help.shopify.com/en/manual/products/import-export/using-csv))
  - 10-source, 60-condition automated collections ([Automated conditions](https://help.shopify.com/en/manual/products/collections/automated-collections/auto-select))
- Shopify itself has no native low-stock alert. It relies on Flow. — [notify-me.io (third-party)](https://notify-me.io/post/how-to-add-low-stock-alerts-on-shopify)

### Inferences: consolidated checklist
| Area | P0 | P1 | P2 |
|---|---|---|---|
| Product list | Table (thumb, title, status, stock, category, price in ৳); title/SKU/tag search; All/Active/Draft/Archived tabs; multi-select → Active/Draft/Archive/Delete; pagination or show-all | Filters (category, tag, collection, stock level); sorting (created, updated, title, stock); bulk tag add/remove; bulk add to collection; CSV export | Custom saved views; column chooser; query syntax; spreadsheet bulk editor; CSV import with overwrite; vendor/market/channel filters |
| Inventory | Track on/off; Available qty; inline "set to"; auto-decrement on order | Adjustment log with Shopify-style reasons (Correction, Count, Received, Return restock, Damaged, Theft/loss, Promotion/donation); "adjust by"; committed vs on-hand; low-stock threshold + badge/filter (+ optional email) | Locations; unavailable states; incoming; inventory CSV; batched pending-save UX |
| Collections | Manual collections: title, handle, description, image, visible flag; assign products | Manual drag order + sort presets; SEO fields; simple rule-based collections (tag / price / compare-at set / in stock, all/any) | Variant-level membership, exclusions, multi-source, metafield/category conditions |
| Files | Product image upload, reorder, alt text, resize/WEBP | Central media library with reuse picker + "used in"; replace file | Video, 3D, generic files, folders, focal point |
| Other | — | — | Gift cards, purchase orders, transfers |

### Gaps
- No source quantified feature usage by small merchants. The priorities above are judgement based on the store profile, not on data.
