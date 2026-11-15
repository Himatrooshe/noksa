# Shopify Admin: Single-Product Create/Edit Page (as of late 2026)

Scope: the "Add product" / product details page only. Target replica: small handmade jute-goods store, single owner, ~10-100 products, Bangladesh, BDT.
Priority tags: **P0** must-have, **P1** nice-to-have, **P2** skip for now.

Sourcing note: Some help.shopify.com sub-pages fetched in this session returned only summary/overview text (pricing, product details, weight, customs). Items marked "(not verified this session)" come from general knowledge of the admin and should be treated as unconfirmed.

## What fields exist on the product page, and how does each behave?

### Takeaway
The page is a two-column form: main column = Title, Description, Media, Category, Pricing, Inventory, Shipping, Variants, Metafields, SEO; side column = Status, Publishing/sales channels, Product organization (type, vendor, collections, tags), Theme template. Major 2025 changes: variant limit raised from 100 to 2,048 (still max 3 options, 250 media), new **Unlisted** status (Oct 2025), and an AI-suggested Standard Product Taxonomy category with auto-populated category metafields.

### Cited Findings

**Title (P0)**
- Title is the only required field when creating a product. — [Shopify Help: Adding and updating products](https://help.shopify.com/en/manual/products/add-update-products)

**Description / rich text editor (P0 for basic formatting; P2 for color/tables/HTML/AI)**
- Text formatting: Bold, Italic, Underline, Clear formatting. — [Shopify Help: Rich text editor](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/rich-text-editor)
- Block formatting menu: Paragraph, Headings 1-6, Blockquote. — [Rich text editor](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/rich-text-editor)
- Bulleted and numbered lists; left/center/right alignment; indent/outdent. — [Rich text editor](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/rich-text-editor)
- Text color and background color (preset swatches or hex). — [Rich text editor](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/rich-text-editor)
- Insert: images (upload, choose from product images, or public URL), YouTube/Vimeo video embeds, tables, links (internal, external, email, phone); audio via HTML. — [Rich text editor](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/rich-text-editor)
- "Show HTML" toggle for raw HTML editing; HTML comments supported. — [Rich text editor](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/rich-text-editor)
- Hard limit of 64 KB of content in the rich text editor. — [Rich text editor](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/rich-text-editor)
- AI: "Generate description with Shopify Magic" button in the Description section; merchant supplies features/keywords/tone; can regenerate and rewrite selected text; free on paid plans. — [Shopify Blog: AI product descriptions](https://www.shopify.com/blog/ai-product-descriptions); [Shopify App Store: Magic product descriptions](https://apps.shopify.com/built-in-features/magic-product-descriptions) (P2)

**Media (P0: multiple images, reorder, first = featured, alt text; P2: video/3D)**
- Images: PNG/JPEG optimal; also TIFF, BMP, GIF, SVG, HEIC, WebP (animated supported). Max 5000 x 5000 px (25 MP), under 20 MB. Recommended 2048 x 2048 px square, consistent aspect ratios. — [Shopify Help: Product media types](https://help.shopify.com/en/manual/products/product-media/product-media-types)
- Video: MP4, MOV, WebM; up to 1 GB, 10 minutes, 4K (4096 x 2160); transcoded to MP4/HLS and streamed at 480p/720p/1080p. — [Product media types](https://help.shopify.com/en/manual/products/product-media/product-media-types)
- 3D: GLB and USDZ only; up to 500 MB; auto-optimized above 15 MB. Video/3D display depends on theme (OS 2.0 / Horizon themes support both). — [Product media types](https://help.shopify.com/en/manual/products/product-media/product-media-types)
- Shopify auto-generates multiple image sizes for different storefront contexts. — [Product media types](https://help.shopify.com/en/manual/products/product-media/product-media-types)
- Max 250 media/images per product (including variant images); this limit was unchanged by the 2,048-variant increase. — [Rich text editor](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/rich-text-editor); [Shopify changelog: 2048 variants](https://changelog.shopify.com/posts/we-ve-increased-the-product-variant-limit-to-2048)
- Alt text is one of the four main places Shopify recommends adding SEO keywords. — [Shopify Help: Adding keywords](https://help.shopify.com/en/manual/promoting-marketing/seo/adding-keywords)
- (not verified this session) Media card supports multi-file drag-and-drop upload, drag-to-reorder, the first item is the featured image, per-item alt text editor, bulk select/delete.

**Product category / taxonomy (P1)**
- Each product has exactly one category from Shopify's Standard Product Taxonomy; AI suggests a category from the name, description and images; merchant accepts or browses manually. — [Shopify Help: Product category](https://help.shopify.com/en/manual/products/details/product-category)
- Choosing a category auto-adds relevant category metafields (e.g., size, color, fabric); editing a value (e.g., "black" -> "graphite") updates across all variants using it. — [Product category](https://help.shopify.com/en/manual/products/details/product-category)
- Category drives tax calculation and sales-channel syncing; taxonomy updates can make old categories show as "uncategorized" with new suggestions to review. — [Product category](https://help.shopify.com/en/manual/products/details/product-category)

**Pricing (P0: price, compare-at; P1: cost + margin; tax toggle P2 for this store)**
- Compare-at price must be higher than Price for a sale to display; theme shows both on product/collection pages, only sale price at checkout; clear the field to end the sale. — [Shopify Help: Sale pricing](https://help.shopify.com/en/manual/products/details/product-pricing/sale-pricing)
- Compare-at is per variant; all variants must have consistent compare-at values for the sale to display on collection pages. Market-specific fixed prices override admin compare-at. — [Sale pricing](https://help.shopify.com/en/manual/products/details/product-pricing/sale-pricing)
- Cost per item is entered in the Pricing section (per product/variant). Margin shown on the product page = ((price - cost) / price) x 100, e.g., $20 price / $10 cost = 50%; based on full price, not discounts. — [Shopify Help: Profit reports](https://help.shopify.com/manual/reports-and-analytics/shopify-reports/report-types/profit-reports?ld=1)
- Profit reports only include sales for which a cost was recorded at time of sale. — [Profit reports](https://help.shopify.com/manual/reports-and-analytics/shopify-reports/report-types/profit-reports?ld=1)
- Pricing section also supports unit pricing. — [Shopify Help: Product details](https://help.shopify.com/en/manual/products/details)
- (not verified this session) "Charge tax on this product" checkbox per variant; profit (absolute) shown next to margin.

**Inventory (P0: track quantity, quantity, continue-selling, SKU; P1: barcode; P2: multi-location)**
- "Track quantity" is toggled per product; enter initial quantities individually, by bulk editor or CSV. Shopify advises not tracking digital products/services. — [Shopify Help: Set up inventory tracking](https://help.shopify.com/en/manual/products/inventory/getting-started-with-inventory/set-up-inventory-tracking)
- "Continue selling when out of stock" supports pre-orders/made-to-order items; it doesn't govern POS, where staff can sell below zero. — [Set up inventory tracking](https://help.shopify.com/en/manual/products/inventory/getting-started-with-inventory/set-up-inventory-tracking)
- SKU identifies products within the business; barcode (ISBN/UPC/GTIN) enables POS scanning, inventory counts, marketplace identification. — [Product details](https://help.shopify.com/en/manual/products/details)
- (not verified this session) Quantity is shown per location; states such as Available / Committed / Unavailable / On hand are editable from the inventory link.

**Shipping (P1: physical toggle + weight; P2: customs)**
- The shipping section covers physical-product designation, weight and units, package, and customs details (country/region of origin, HS code). — [Shopify Help: International](https://help.shopify.com/en/manual/international/customs-information) (summary-level fetch; low confidence on details)
- (not verified this session) Weight units kg/g/lb/oz; weight is per variant; unchecking "physical product" hides weight/shipping fields (for digital goods/services).

**Variants & options (P0: options and per-variant price/stock/SKU/image for size/color jute bags; P2: >100 variants, per-channel variant publishing)**
- Each combination of option values can be a variant (e.g., size S/M/L x color blue/green). — [Shopify Help: Variants](https://help.shopify.com/en/manual/products/variants)
- Variants can be unpublished per sales channel while keeping history; inventory is managed per variant; variant metafields supported. Help page notes a redesigned product details interface rolling out gradually. — [Variants](https://help.shopify.com/en/manual/products/variants)
- **Changed Oct 15, 2025:** variant limit raised from 100 to **2,048 for all merchants**; still **max 3 options** per product; 250 media limit unchanged; stores with 50k+ variants limited to 1,000 new variants/day. — [Shopify changelog](https://changelog.shopify.com/posts/we-ve-increased-the-product-variant-limit-to-2048); [Shopify dev changelog](https://shopify.dev/changelog/the-product-variant-limit-is-now-2048-for-all-merchants)
- (not verified this session) Variant table groups by an option, supports inline price/quantity editing, select-and-bulk-edit, per-variant detail page (price, compare-at, cost, SKU, barcode, weight, image).

**Status (P0: Active/Draft; P1: Archived; P2: Unlisted)**
- Status options shown on the product page: Active, Draft, Unlisted. Archived is applied via an action; archived products move to an Archived tab and unarchiving sets status to Draft. — [Adding and updating products](https://help.shopify.com/en/manual/products/add-update-products)
- **New Oct 21, 2025: Unlisted** — hidden from storefront search, collections, recommendations, sitemap.xml and Shopify Catalog; adds `noindex,nofollow`; still reachable via direct URL, purchasable in cart/checkout, retrievable by handle/ID via Storefront/Liquid APIs. Pre-2025-10 Admin APIs report it as `active`. — [Shopify dev: Unlisted products](https://shopify.dev/docs/apps/build/product-merchandising/unlisted-products); [Shopify dev changelog: Unlisted](https://shopify.dev/changelog/new-unlisted-product-status)

**Publishing / sales channels (P2 for a single own-site store)**
- Publishing section controls availability across sales channels, markets and B2B catalogs. — [Adding and updating products](https://help.shopify.com/en/manual/products/add-update-products)

**Product organization (P1: type, collections, tags; P2: vendor)**
- Section contains Type, Vendor, Collections, Tags. — [Adding and updating products](https://help.shopify.com/en/manual/products/add-update-products)
- Tags: comma-separated; up to 250 per product (unlimited on Plus); max 255 characters per tag. — [Adding and updating products](https://help.shopify.com/en/manual/products/add-update-products)
- Product type is custom (one per product), used for internal organization and when no standard category fits. — [Product category](https://help.shopify.com/en/manual/products/details/product-category)

**Search engine listing (P0: handle; P1: SEO title/meta description with preview)**
- Editable page title (over 70 chars may be cut off), meta description (over 320 chars may be truncated), and URL handle (no spaces). — [Adding and updating products](https://help.shopify.com/en/manual/products/add-update-products)
- SEO guidance: title up to 70 chars (aim ~60); meta description ~160 recommended. — [Adding keywords](https://help.shopify.com/en/manual/promoting-marketing/seo/adding-keywords) (note: different numbers from the 320 truncation figure above; 320 is the field-level truncation, 160 is a best-practice target)
- Edited via "Edit" on the search-preview snippet. Changing the handle shows a pre-checked "Create a URL redirect" checkbox producing a 301 from old URL; merchant can uncheck. — [GemPages: product handles](https://gempages.net/blogs/shopify/shopify-product-handles); [Shopify Community thread](https://community.shopify.com/t/question-about-old-product-urls-redirects-and-seo/574412) (third-party, not Shopify docs)
- (not verified this session) Handle auto-generated from title on first save (lowercased, hyphenated, deduplicated with -1, -2); SEO title/description default to product title/description when empty.

**Theme template (P2)**
- (not verified this session) Side-column dropdown to choose an alternate product template from the Online Store theme.

### Inferences
- For a jute store with <=100 products, a single-location inventory model with per-variant quantity, SKU, price, compare-at and image covers nearly all needs. Options will rarely exceed 2 (size, color); a cap of 3 options matches Shopify.
- Margin display (price vs cost) is cheap to implement and valuable for handmade goods with variable material costs (P1).
- Tax toggle, customs/HS codes, multi-market pricing, sales channels, B2B catalogs, 3D models, theme templates and taxonomy-driven metafields are enterprise/multichannel features: P2.
- Unlisted is a useful low-cost P2/P1 (e.g., custom orders shared by link) — just a status that excludes the product from listings/sitemap and adds noindex.
- A minimal rich text editor (bold/italic/headings/lists/links) plus sanitized HTML storage is sufficient; enforce a size cap similar to 64 KB.

### Gaps
- Could not fetch full Shopify docs on the shipping card, cost-per-item field UI, or "charge tax" checkbox; details flagged "not verified" above.
- No primary Shopify source fetched for handle auto-generation rules or SEO-field defaults.
- Polaris "resource details layout" URL now redirects to shopify.dev/docs/api/polaris; exact card ordering of the current redesigned product page was not confirmed from a primary source.
- Exact per-option value limits (beyond 3 options / 2,048 variants) not confirmed.

## Which features are essential for a small single-owner store vs advanced/enterprise?

### Takeaway
Essentials: title, description, images with alt text and ordering, price/compare-at, inventory quantity + continue-selling, simple options/variants, Active/Draft status, handle/SEO, tags/collections. Advanced: channels/markets/B2B, taxonomy metafields, customs, 3D/video, templates, >100 variants, Plus-only tag limits.

### Cited Findings
- Shopify itself suggests skipping inventory tracking for digital products/services and using "continue selling" for made-to-order — relevant to handmade goods. — [Set up inventory tracking](https://help.shopify.com/en/manual/products/inventory/getting-started-with-inventory/set-up-inventory-tracking)
- Video/3D only render on compatible themes, signalling these are add-ons rather than core. — [Product media types](https://help.shopify.com/en/manual/products/product-media/product-media-types)
- Publishing spans channels, markets and B2B catalogs — multi-channel/enterprise concerns. — [Adding and updating products](https://help.shopify.com/en/manual/products/add-update-products)
- Tag limit differs by plan (250 vs unlimited on Plus). — [Adding and updating products](https://help.shopify.com/en/manual/products/add-update-products)

### Inferences
Suggested priority summary:
- **P0:** Title; description (basic RTE); media upload (multi), reorder, featured = first, alt text; price; compare-at price; status Active/Draft; track quantity + quantity; continue selling when out of stock (made-to-order); SKU; options (up to 3) generating variants with per-variant price/stock/SKU/image; URL handle (auto from title, editable); save bar + unsaved-changes guard; delete with confirm.
- **P1:** Cost per item + margin display; collections; tags; product type; SEO title/meta description with Google-style preview and char counters; Archived status; duplicate product; physical-product weight (for courier rates); barcode; redirect on handle change; Unlisted status.
- **P2:** Category taxonomy + category metafields; vendor (single maker); charge-tax toggle (depends on BD VAT treatment); unit price; customs/HS code/country of origin (only if exporting); video/3D; multi-location inventory; sales channels/markets/B2B; theme template selector; AI description generation; variant per-channel publishing; >100 variants.

### Gaps
- No source on BD-specific VAT handling for small online sellers; tax-toggle priority is a judgment call.

## How does the save flow work (save bar, unsaved changes, duplicate, delete/archive)?

### Takeaway
Edits are not autosaved: a contextual save bar (Save / Discard) appears when the form is dirty, and navigation away prompts a leave confirmation. Duplicate creates a new product with selectable copied details; Archive is reversible (returns as Draft); Delete is permanent.

### Cited Findings
- Admin save bar indicates unsaved form data; shows on form changes, Save triggers submit and Discard triggers reset; `leaveConfirmation()` prompts the merchant before leaving with unsaved changes. — [Shopify dev: Save Bar API](https://shopify.dev/docs/api/app-home/apis/save-bar) (this is the app-facing API mirroring the native admin pattern)
- Duplicate creates a new product; merchant can choose which details to copy; 3D models and videos aren't copied automatically. — [Adding and updating products](https://help.shopify.com/en/manual/products/add-update-products)
- Archive hides without deleting; archived products move to a dedicated tab; unarchiving sets status to Draft. — [Adding and updating products](https://help.shopify.com/en/manual/products/add-update-products)
- Delete is permanent and cannot be restored. Bulk tag/archive/delete is available from the product list. — [Adding and updating products](https://help.shopify.com/en/manual/products/add-update-products)
- Deleting products outright skips URL redirects (old URLs 404). — [GemPages: product handles](https://gempages.net/blogs/shopify/shopify-product-handles) (third-party)

### Inferences
- Replicate: dirty-state tracking -> sticky save bar with Save/Discard; `beforeunload` + in-app route guard; footer/header actions "Duplicate", "Archive", "Delete" (delete behind confirm modal, recommend archive instead). Duplicate dialog: new title ("Copy of ..."), checkboxes for which details to copy, new draft status, fresh handle.
- (not verified this session) Header also has prev/next product pagination arrows and "Preview" / "View" links.

### Gaps
- Did not confirm from a primary source whether a duplicated product defaults to Draft status or copies inventory quantities.
