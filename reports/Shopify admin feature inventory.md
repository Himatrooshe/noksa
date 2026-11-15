# Build a fifth of Shopify's admin

A small handmade jute store needs about 20% of what Shopify's admin offers. The rest mostly serves multi-location, multi-market, multi-staff, card-authorization or B2B merchants. The P0 core has five parts. First, a two-column product form with title, basic rich text, multiple images that can be reordered and given alt text, price plus compare-at price, stock tracking with a "made to order" override, up to three options that generate variants, Active/Draft status, and an editable URL handle. Second, a product table with status tabs and bulk status actions. Third, manual collections. Fourth, an orders module built on three separate status fields (order, payment, fulfillment) with a manual "Mark as paid" step. Fifth, phone-keyed customers and a Home page with sales, order and average-order-value tiles plus a to-do list. Shopify already handles cash-on-delivery and off-gateway wallets as "manual payments". These orders stay Pending until the merchant marks them paid ([Shopify Help: manual payments](https://help.shopify.com/en/manual/payments/manual-payments)), so Shopify's model fits Bangladesh well. Noksa should improve on it in four places where Shopify is weak for this market. It should record the bKash/Nagad transaction ID when marking an order paid, offer bulk mark-as-paid for courier COD remittances, record partial payments (advance plus COD balance), and make manual order entry a first-class screen for Facebook and WhatsApp orders. Shopify changed several things in 2025-2026: up to 2,048 variants, a new Unlisted status, a unified search/filter bar, change-tracked inventory adjustments, redesigned order line items and batch fulfillment. None of these changes alter what a 10-100 product store needs. The priorities below are judgments based on the store's profile. No source measures which features small merchants actually use.

## The product form: 13 P0 fields cover the whole page

Shopify's product page is a two-column form. The main column holds Title, Description, Media, Category, Pricing, Inventory, Shipping, Variants, Metafields and SEO. The side column holds Status, Publishing, Product organization and Theme template. **Title is the only required field** ([Shopify Help: Adding and updating products](https://help.shopify.com/en/manual/products/add-update-products)). The description editor is fairly complete. It has bold/italic/underline, headings H1-H6, blockquote, lists, alignment, text colour, tables, image and YouTube/Vimeo embeds, links, a "Show HTML" toggle and a **64 KB content cap** ([Shopify Help: Rich text editor](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/rich-text-editor)). A jute store needs only the formatting subset, stored as sanitized HTML with a similar size limit. The Shopify Magic AI description generator ([Shopify Blog](https://www.shopify.com/blog/ai-product-descriptions)) is a P2 extra.

Media matters most for handmade goods, because the photos do the selling. Shopify accepts most image formats up to **5000×5000 px / 25 MP / 20 MB**, recommends **2048×2048 square**, and generates resized versions automatically. It also allows video (up to 1 GB, 10 min, 4K) and 3D models (GLB/USDZ). Each product can have up to **250 media items** ([Shopify Help: Product media types](https://help.shopify.com/en/manual/products/product-media/product-media-types)). Shopify lists alt text among the four main places to put SEO keywords ([Shopify Help: Adding keywords](https://help.shopify.com/en/manual/promoting-marketing/seo/adding-keywords)). The research did not confirm the exact media-card behaviour from a primary source. That behaviour is multi-file drag-and-drop, drag-to-reorder, first image as the featured image, and per-image alt text. It is still the standard pattern and the right one to copy. Noksa should also resize images on the server and convert them to WebP, because phone photos are large.

Pricing has two parts that matter here. **Compare-at price only shows a sale when it is higher than Price.** For a sale to show on collection pages, every variant needs consistent compare-at values ([Shopify Help: Sale pricing](https://help.shopify.com/en/manual/products/details/product-pricing/sale-pricing)). Cost per item gives a margin of ((price − cost) / price) × 100 on the product page. Profit reports only count sales that had a cost recorded at the time of sale ([Shopify Help: Profit reports](https://help.shopify.com/manual/reports-and-analytics/shopify-reports/report-types/profit-reports?ld=1)). That is a reason to add cost early, even as a P1, because handmade material costs vary from batch to batch. For inventory, Shopify uses a per-product "Track quantity" toggle and a **"Continue selling when out of stock" flag that it explicitly suggests for made-to-order items** ([Shopify Help: Set up inventory tracking](https://help.shopify.com/en/manual/products/inventory/getting-started-with-inventory/set-up-inventory-tracking)). That flag is P0 for a handmade store. SKU is for internal identification. Barcode (GTIN/UPC) is for POS scanning and marketplaces ([Shopify Help: Product details](https://help.shopify.com/en/manual/products/details)), so it is P1 at most.

On **15 October 2025** Shopify raised the variant limit from 100 to **2,048**. The cap stays at **three options** per product, and the 250-media limit is unchanged ([Shopify changelog](https://changelog.shopify.com/posts/we-ve-increased-the-product-variant-limit-to-2048)). A jute bag in three sizes and four colours has 12 variants, so copying the three-option cap is enough. On **21 October 2025** Shopify added **Unlisted**, a fourth status. An Unlisted product is hidden from search, collections, recommendations and the sitemap and gets `noindex`. It can still be bought through a direct link ([Shopify dev: Unlisted products](https://shopify.dev/docs/apps/build/product-merchandising/unlisted-products)). That suits one-off custom commissions shared over WhatsApp. Archive is reversible and returns a product as Draft. Delete is permanent. Duplicate lets the merchant choose which details to copy ([Shopify Help: Adding and updating products](https://help.shopify.com/en/manual/products/add-update-products)). Edits are never autosaved. A save bar with Save/Discard appears when the form has changes, and a leave confirmation guards against navigating away ([Shopify dev: Save Bar API](https://shopify.dev/docs/api/app-home/apis/save-bar)). The SEO listing has a page title (cut off above 70 characters), a meta description (truncated above 320, about 160 recommended) and a URL handle ([Shopify Help: Adding and updating products](https://help.shopify.com/en/manual/products/add-update-products)). According to third-party sources, changing the handle offers a pre-checked 301 redirect ([GemPages](https://gempages.net/blogs/shopify/shopify-product-handles)).

| Feature (Shopify product page) | Tier | Note for Noksa |
|---|---|---|
| Title (required) | **P0** | Only required field |
| Description: bold/italic/headings/lists/links, sanitized HTML, ~64 KB cap | **P0** | |
| Description: colours, tables, video embeds, raw-HTML toggle | P2 | |
| AI description generation | P2 | |
| Multiple image upload, drag reorder, first = featured | **P0** | Server-side resize + WebP |
| Per-image alt text | **P0** | Cheap, and helps SEO |
| Video / 3D media | P2 | |
| Price (BDT) | **P0** | Integer taka is fine |
| Compare-at price (sale) | **P0** | Validate that it is higher than price |
| Cost per item + margin display | P1 | Record it from the start for later profit reports |
| Unit pricing, charge-tax toggle | P2 | Depends on BD VAT treatment (not researched) |
| Track quantity toggle + quantity | **P0** | |
| Continue selling when out of stock (made to order) | **P0** | Key for handmade goods |
| SKU | **P0** | |
| Barcode | P1 | |
| Multi-location quantities | P2 | |
| Options (≤3) → variants with per-variant price/compare-at/stock/SKU/image | **P0** | Size × colour |
| >100 variants, per-channel variant publishing, variant metafields | P2 | |
| Status: Active / Draft | **P0** | |
| Status: Archived (reversible, restores to Draft) | P1 | |
| Status: Unlisted (link-only) | P1 | Custom orders shared by link |
| Product type | P1 | One per product |
| Tags | P1 | |
| Collections assignment from the form | **P0** | |
| Vendor | P2 | Single maker |
| Standard taxonomy category + category metafields | P2 | |
| URL handle (auto from title, editable) | **P0** | |
| SEO title + meta description with preview/char counters | P1 | |
| 301 redirect on handle change | P1 | |
| Physical product + weight | P1 | For courier rate rules |
| Customs / HS code / country of origin | P2 | Only if exporting |
| Sales channels, markets, B2B catalogs, theme template | P2 | |
| Save bar + unsaved-changes guard | **P0** | |
| Delete with confirmation | **P0** | Encourage Archive instead |
| Duplicate product | P1 | |

## The catalog screens: a filterable table, a stock log and manual collections

Shopify's Products index shows **50 products per page**. Merchants can pick and reorder columns, sort by **seven keys** (title, created as the default, updated, inventory, type, publishing date, vendor), and use fixed All/Active/Draft/Archived tabs. Sorting is not saved with a view ([Shopify Help: View and sort products](https://help.shopify.com/manual/products/view-sort-products)). Search covers titles, descriptions and tags. It supports field syntax such as `tag:new` but cannot match text in the middle of a word. There are roughly fifteen filters, combined with AND, and most of them (sales channel, region catalog, B2B, company location, retail catalog, publishing error, combined listings) only apply to multichannel or B2B sellers ([Shopify Help: Searching and filtering](https://help.shopify.com/manual/products/searching-filtering)). A Shopify app developer reports that search, filters and saved views were merged into one bar in **April 2026** ([Pasilobus](https://www.pasilobus.com/blogs/articles/shopify-just-made-admin-search-and-filters-actually-useful)). No official changelog confirms this. Bulk selection opens a spreadsheet-style bulk editor ([Shopify Help: Bulk editing](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/bulk-editing)). CSV import and export key on Title and handle, and "overwrite" mode blanks out empty cells ([Shopify Help: Using CSV](https://help.shopify.com/en/manual/products/import-export/using-csv)). With 100 products, Noksa can load the whole catalog into the browser and filter it there. That makes saved views, query syntax and server-side pagination unnecessary.

Inventory is where Shopify's model is heaviest compared with what this store needs. Every variant at every location has states: **On hand = Committed + Unavailable + Available**, with Incoming tracked separately ([Shopify Help: Inventory states](https://help.shopify.com/en/manual/products/inventory/managing-inventory-quantities/inventory-states)). Merchants edit Available or On hand inline in "Set to" or "Adjust by" mode and save a batch of pending changes ([Shopify Help: Change quantities](https://help.shopify.com/en/manual/locations/changing-quantities/change-quantities-by-product)). Since **7 May 2026** each adjustment records source, destination, user and time ([Shopify Changelog](https://changelog.shopify.com/posts/inventory-adjustment-workflow-now-with-full-change-tracking)). Adjustment history shows **180 days**, and the manual reasons are Correction, Count, Received, Return restock, Damaged, Theft or loss, and Promotion or donation ([Shopify Help: Adjustment history](https://help.shopify.com/en/manual/inventory-and-locations/adjusting-inventory/adjustment-history)). **Shopify has no built-in low-stock alert.** Merchants sort by quantity or build a Shopify Flow workflow that sends one email per product ([notify-me.io](https://notify-me.io/post/how-to-add-low-stock-alerts-on-shopify)). Noksa can beat Shopify here cheaply. A per-product low-stock threshold with a badge and a "Low stock" filter is a few lines of code, and an append-only adjustments table that reuses Shopify's seven reasons provides an audit trail.

Collections are either **manual** (products or variants picked by hand) or **automated**. Automated collections match all or any conditions on title, type, vendor, category, tags, status, price, compare-at price, weight, stock and metafields. They allow up to 60 condition values per source and 10 sources per collection, and exclusions work only on category, tag, type and vendor ([Shopify Help: Automated collection conditions](https://help.shopify.com/en/manual/products/collections/automated-collections/auto-select)). Collections have six sort orders, including **Manual drag-to-rearrange**, plus a title, description and featured image ([Shopify Help: Collection layout](https://help.shopify.com/en/manual/products/collections/collection-layout)). A jute store needs only a few manual collections (Bags, Baskets, Home décor, Gifts). Rules are worth adding only for "Sale" (compare-at price is set) and "New arrivals". Content > Files is a store-wide library with alt text, file replacement, focal points, folders, a "usage" filter, image limits of **20 MB / 25 MP**, and storage of **100 GB on Basic** ([Shopify Help: Files](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/file-uploads)). Shopify also offers gift cards ([Shopify Help: Gift cards](https://help.shopify.com/en/manual/products/gift-card-products)), purchase orders ([Shopify Help: Purchase orders](https://help.shopify.com/manual/products/inventory/purchase-orders)) and transfers ([Shopify Help: Transfers](https://help.shopify.com/manual/products/inventory/transfers)). A single-location maker can skip all three.

| Area | Feature | Tier |
|---|---|---|
| Product list | Table: thumbnail, title, status badge, stock summary ("12 in stock" / "Not tracked" / "Made to order"), type, price in ৳ | **P0** |
| Product list | Text search on title, SKU, tags | **P0** |
| Product list | Fixed tabs All / Active / Draft / Archived | **P0** |
| Product list | Multi-select bulk actions: set Active, set Draft, Archive, Delete (confirm) | **P0** |
| Product list | Filters: type, tag, collection, stock level (in/low/out) | P1 |
| Product list | Sort: created (default newest), updated, title, stock | P1 |
| Product list | Bulk add/remove tags, bulk add to collection | P1 |
| Product list | CSV export (backup / spreadsheet edit) | P1 |
| Product list | Inline price/stock edit (cheap substitute for the bulk editor) | P1 |
| Product list | Custom saved views, column chooser, query syntax, metafield/market/B2B filters | P2 |
| Product list | Spreadsheet bulk editor; CSV import with overwrite (P1 only for the first catalog load) | P2 |
| Inventory | Available quantity per product/variant + track on/off | **P0** |
| Inventory | Inline "Set to" edit | **P0** |
| Inventory | Auto-decrement on order; restock on cancel | **P0** |
| Inventory | Adjustment log (who, when, delta, new total, reason using Shopify's 7 reasons) | P1 |
| Inventory | "Adjust by ±N" mode | P1 |
| Inventory | Committed count from unfulfilled orders (Available = On hand − Committed) | P1 |
| Inventory | Low-stock threshold + badge + filter (+ optional email); Shopify lacks this natively | P1 |
| Inventory | Multiple locations, Unavailable sub-states, Incoming, inventory CSV, batched pending-save | P2 |
| Collections | Manual collections: title, handle, description, image, visible flag | **P0** |
| Collections | Many-to-many assignment from the product form and a product picker | **P0** |
| Collections | Manual drag ordering + sort presets (newest, price, A-Z, best-selling) | P1 |
| Collections | Collection SEO title/description | P1 |
| Collections | Simple rule collections (tag includes, price <, compare-at set, in stock; all/any) | P1 |
| Collections | Variant membership, exclusions, multi-source, metafield/category/weight conditions | P2 |
| Files | Image upload (JPEG/PNG/WebP) attached to products, ~10-20 MB cap, resize/WebP | **P0** |
| Files | Central media library with reuse picker, "used in" count, replace file | P1 |
| Files | Video, 3D, generic files, folders, focal points, HEIC (or convert on upload) | P2 |
| Other | Gift cards, purchase orders, transfers | P2 |

## Orders: three status axes and one adapted "Mark as paid"

Shopify does not store one status per order. It tracks three independent axes. **Order status** is Open, Archived or Canceled. **Payment status** is Pending, Authorized, Due, Expiring, Expired, Paid, Partially paid, Refunded, Partially refunded or Voided, and "Unpaid" is a combined filter over the unsettled states. **Fulfillment status** is Unfulfilled, In progress, On hold, Scheduled, Partially fulfilled, Fulfilled or Fulfillment not required. A fourth axis tracks returns ([Shopify Help: Order status](https://help.shopify.com/en/manual/fulfillment/managing-orders/order-status)). About half of the payment states exist only because of card authorizations and B2B payment terms. A COD/bKash store needs Pending, Paid, Partially paid, Refunded, Partially refunded and Voided. Manual-payment orders show as unpaid and incur no third-party transaction fees ([Shopify Help: manual payments](https://help.shopify.com/en/manual/payments/manual-payments)). The merchant settles them with **Collect payment → Mark as paid** ([Avada](https://avada.io/shopify/docs/how-mark-manual-payment-as-paid-shopify.html); [shopify.dev: orderMarkAsPaid](https://shopify.dev/docs/api/admin-graphql/latest/mutations/orderMarkAsPaid.md)). Shopify's flow has two gaps for Bangladesh. The research found no field for a wallet transaction reference, and **"Mark as paid" is not a bulk action**. Bulk payment covers only "Capture order payments" ([Shopify Help: bulk actions](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/bulk-actions)). Courier COD remittances settle dozens of orders at once, so Noksa should add a payment-method field plus TrxID at P0 and bulk mark-as-paid at P1.

The Orders index lets merchants search by order number, customer name, email or product, and filter by fulfillment status, payment status, channel, date, tags and metafields, with saved views ([Shopify Help: Viewing orders](https://help.shopify.com/en/manual/fulfillment/managing-orders/viewing-orders)). Desktop bulk actions include fulfill, capture, print packing slips, archive/unarchive, cancel, add/remove tags, mark in progress/unfulfilled, and shipping labels ([Shopify Help: bulk actions](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/bulk-actions)). Orders can be fulfilled individually, in bulk or in batches ([Shopify Help: Fulfilling orders](https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/fulfill-orders)). A secondary source dates batches of up to 250 to October 2026 ([consensus.pt](https://consensus.pt/shopify/news/shopify-updates-october-2026/)). Order editing covers adding or removing items, changing quantities, shipping fees, manual discounts and customer details. It then sends an invoice for any balance or prompts a refund ([Shopify Help: Editing orders](https://help.shopify.com/en/manual/fulfillment/managing-orders/editing-orders)). Line items were redesigned on **9 March 2026** with a dedicated pricing column ([Shopify Changelog](https://changelog.shopify.com/posts/improved-visual-hierarchy-for-line-items-in-orders-and-returns)). The research could not confirm several details from primary text: the exact default columns, the fulfil dialog's fields, the cancel options, and how the timeline behaves. The layout below follows the standard Shopify pattern rather than a verified card list.

Draft orders are the feature that matters most locally. Shopify built them for phone, email and in-person orders. A draft takes catalog or custom line items, discounts, shipping, notes and tags, and is paid by invoice link, card entry or **Mark as paid**. Paid drafts become regular orders, and since April 2025 drafts are deleted after a year without activity ([Shopify Help: Draft orders](https://help.shopify.com/en/manual/fulfillment/managing-orders/create-orders)). Customers in Bangladesh rarely pay through emailed checkout links. Noksa should therefore skip the separate draft state and give the owner a "Create order" form that writes a real order directly, with the source channel (Facebook/WhatsApp/Phone/Instagram) recorded. Abandoned checkouts are defined by an email entered and no purchase after 10 minutes, and are auto-deleted after three months ([Shopify Help: Abandoned checkouts](https://help.shopify.com/en/manual/orders/abandoned-checkouts)). They depend on email, which this market does not use much, so they are P2.

| Area | Feature | Tier |
|---|---|---|
| Status model | Three separate fields: order {open, archived, canceled}; payment {pending, paid, partially_paid, refunded, partially_refunded, voided}; fulfillment {unfulfilled, in_progress, on_hold, partially_fulfilled, fulfilled} | **P0** |
| Status model | Authorized / Due / Expiring / Expired, payment terms, return-status axis | P2 |
| Payments | Payment method (COD / bKash / Nagad / bank) + transaction ID captured at Mark as paid | **P0** (local addition) |
| Payments | Partial payment (advance delivery charge via bKash + COD balance) | P1 |
| Payments | Manual refund record (amount + method) | P1 |
| Order list | Columns: order #, date, customer, total ৳, payment badge, fulfillment badge, items, payment method | **P0** |
| Order list | Columns: delivery zone (inside/outside Dhaka), channel, tags | P1 |
| Order list | Fixed tabs All / Unfulfilled / Unpaid / Open / Archived | **P0** |
| Order list | Search by order #, name, **phone**, email | **P0** |
| Order list | Filters: payment status, fulfillment status, date range | **P0** |
| Order list | Filters: tags, channel | P1 |
| Order list | Bulk: mark fulfilled, mark as paid, print slips/invoices, archive | P1 |
| Order list | Bulk: tags, cancel; custom saved views; metafield filters | P2 |
| Order detail | Header with badges + actions (Mark as paid, Fulfill, Print, Cancel, Archive) | **P0** |
| Order detail | Line items (image, title, variant, qty × price) grouped Unfulfilled/Fulfilled | **P0** |
| Order detail | Totals: subtotal, discount, delivery charge, total, paid, balance due (tax hidden) | **P0** |
| Order detail | Fulfill: quantities, courier (Pathao/Steadfast/RedX/Sundarban/self), consignment/tracking ID | **P0** |
| Order detail | Customer card, shipping address, billing (same-as-shipping default) | **P0** |
| Order detail | Internal note | **P0** |
| Order detail | Cancel with restock + reason | **P0** |
| Order detail | Tags; timeline of events + internal comments | P1 |
| Order detail | Edit order after placement (items, qty, delivery fee, discount) | P1 |
| Order detail | Print packing slip / invoice (BDT, logo) | P1 |
| Order detail | Customer notification on fulfil (SMS/WhatsApp over email) | P1 |
| Order detail | Returns workflow, risk analysis, shipping labels, Sidekick, courier APIs | P2 |
| Manual orders | Create order form: find/create customer by phone, catalog + custom items, discount, delivery charge, payment method/status, channel, note | **P0** |
| Manual orders | Shareable order-summary link for WhatsApp | P1 |
| Manual orders | Separate draft state, emailed invoice/checkout link, auto-expiry | P2 |
| Abandoned checkouts | Recovery list/emails | P2 (P1 later if checkout captures phone early) |

## Customers and Home: phone numbers and a to-do list

Shopify's customer list defaults to name, email subscription status, location, order count and amount spent, and the columns can be changed. The detail page holds contact information, order history, multiple addresses, staff-only notes, up to 250 tags, a timeline and metafields. Merchants can create customers manually, bulk-edit, merge, delete or GDPR-erase them, and import or export CSV. Each profile is limited to **one email** ([Shopify Help: Manage customers](https://help.shopify.com/en/manual/customers/manage-customers)). Segments are dynamic lists defined by ShopifyQL rules on spend, order count, last order date and tags ([Shopify Help: Customer segmentation](https://help.shopify.com/en/manual/customers/customer-segmentation)). That is too much for a few hundred buyers. Noksa should identify customers by phone number where Shopify uses email, enforce a unique phone number, and replace segments with two saved filters: repeat customers and high spenders.

Shopify Home shows **four metric tiles: by default Sessions, Total sales, Total orders and Conversion rate**. The merchant can choose the tiles, date range and channel. Below the tiles is a task list (payments to capture, orders to fulfil, returns, chargebacks) and AI insight cards, which appear only for stores averaging 10 or more orders a week ([Shopify Help: Shopify Home](https://help.shopify.com/en/manual/shopify-admin/shopify-home)). The Analytics overview has customizable, resizable cards that update within about a minute, with period comparison and metric targets. A **September 2026 change to how sessions are measured** moved session-based numbers without any change in real traffic ([Shopify Help: Analytics overview](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/overview-dashboard)). That change shows sessions and conversion are hard to measure well. They belong in a third-party analytics tool, not in a custom admin. For Noksa, Home should keep Shopify's tile layout but use Total sales, Orders and Average order value. The task list should be adapted to "orders to fulfil", "unpaid COD/bKash orders to confirm" and "orders awaiting delivery confirmation".

| Area | Feature | Tier |
|---|---|---|
| Customers | List: name, **phone**, orders count, amount spent ৳; search by name/phone | **P0** |
| Customers | List: email, district/location, last order date | P1 |
| Customers | Detail: contact, order history + totals, addresses, internal notes | **P0** |
| Customers | Manual create (also inline in Create order) | **P0** |
| Customers | Tags; unique-phone dedupe; delete/erase; CSV export; repeat/high-spender filters | P1 |
| Customers | Timeline, marketing consent, metafields, merge tool, CSV import, segments | P2 |
| Home | KPI tiles for Today / 7d / 30d / custom: Total sales ৳, Orders, AOV | **P0** |
| Home | To-do counts: to fulfil, unpaid to confirm, awaiting delivery | **P0** |
| Home | Low-stock card linking to the inventory filter | P1 |
| Analytics | Previous-period comparison, sales-over-time chart, top products | P1 |
| Analytics | Sales by channel (Facebook/WhatsApp/web), payment-method split, returning-customer rate | P1 |
| Analytics | Profit report (requires cost per item) | P1 |
| Analytics | Sessions, conversion rate, Insights, metric targets, Sidekick, custom card layout, ShopifyQL | P2 |

## Conclusion

Comparing Shopify's admin with this store shows that its complexity comes mostly from scale and payment infrastructure, not from what makes commerce hard. Remove card authorization, multiple locations, markets, B2B and multiple staff, and what remains is a small set of well-designed patterns worth copying exactly. Those are the three-axis order status, the save bar with a leave guard, compare-at sale pricing, continue-selling for made-to-order items, reversible archiving, and reasoned stock adjustments. The places where Noksa should differ are all local. They are wallet transaction IDs, bulk settlement of COD remittances, split advance-plus-COD payments, phone-first customer identity, channel tagging for social orders, and a low-stock alert that Shopify still does not include.

Some details remain open. The research could not confirm from primary sources the exact default columns on the Products and Orders lists, the fields in the fulfil and cancel dialogs, how the order timeline behaves, or whether Shopify's "Collect payment" dialog accepts a partial amount or a reference for manual methods. The April 2026 unified search bar and the October 2026 batch fulfilment are reported only by secondary sources. Courier APIs (Pathao, Steadfast, RedX) and Bangladesh VAT treatment were out of scope. They will decide whether shipping weight and the tax toggle move up from P1/P2, and they should be researched before the order and fulfilment schema is final.
