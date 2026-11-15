# Shopify Admin: Orders, Customers, Home Dashboard & Analytics (as of Nov 2026)

Context: inventory for replicating essentials in a custom admin for a small single-owner handmade jute-goods store in Bangladesh (10-100 products, BDT, payments mostly COD / bKash / Nagad = "manual payments" in Shopify terms).
Priority tags: **P0** must-have, **P1** nice-to-have, **P2** skip for now.

Method note: Many Shopify Help Center deep-link URLs now redirect to section overview pages, so several fine-grained UI details (exact column list, order-detail card labels, fulfill dialog fields, timeline behaviour) could not be confirmed from primary text in this session. Those are flagged in Gaps or marked "unverified" in Inferences.

## 1. Order and payment status model (incl. manual/COD payments)

### Takeaway
Shopify tracks three independent status axes per order: order status (Open / Archived / Canceled), payment status (Pending, Authorized, Paid, Partially paid, Refunded, Partially refunded, Voided, Due, Expiring, Expired, plus composite "Unpaid"), and fulfillment status (Unfulfilled, In progress, On hold, Scheduled, Partially fulfilled, Fulfilled, Fulfillment not required), plus a separate return status. COD / bank transfer / mobile-wallet-outside-gateway orders are "manual payments": they arrive as Pending/unpaid and the merchant uses "Collect payment" > "Mark as paid" on the order page once money is received.

### Cited Findings
- Order status values: **Open** ("placed or created. There is work to do"), **Archived** ("manually or automatically archived"), **Canceled** ("If a canceled order was not fully refunded, then there might be work remaining") — [Shopify Help: order status](https://help.shopify.com/en/manual/fulfillment/managing-orders/order-status)
- Payment status values and meanings — [Shopify Help: order status](https://help.shopify.com/en/manual/fulfillment/managing-orders/order-status):
  - **Pending**: processing initiated; customer used a non-card method, or "Payment due later" terms were set
  - **Authorized**: payment validated, awaiting manual capture before the authorization expires
  - **Due**: not captured by the deadline set in payment terms
  - **Expiring**: badge shown 2 days before capture deadline
  - **Expired**: "wasn't captured before the date that was set by the payment provider"
  - **Paid**: "automatically or manually captured, or the order was marked as paid"
  - **Partially paid**: "You manually captured payment for the order and specified less than the full order value"
  - **Refunded** / **Partially refunded**
  - **Voided**: authorized payment voided, releasing the hold
  - **Unpaid**: composite filter state covering Authorized, Pending, Expired and Partially paid
- Fulfillment status values: **Unfulfilled** (initial), **In progress** (picking/packing), **On hold** (inventory can be reserved but can't fulfill until hold released), **Scheduled** (prepaid subscriptions), **Partially fulfilled**, **Fulfilled**, **Fulfillment not required** — [Shopify Help: order status](https://help.shopify.com/en/manual/fulfillment/managing-orders/order-status)
- Return status values: **Return requested**, **Return in progress**, **Returned**, **Inspection complete** — [Shopify Help: order status](https://help.shopify.com/en/manual/fulfillment/managing-orders/order-status)
- Manual payment methods (COD, money order, bank deposit/transfer, custom) let customers order without a card; the merchant collects money separately and then approves the order. "Orders that accept manual payments are marked as unpaid on the Orders page" (status shown as Pending). No third-party transaction fees for manual payments — [Shopify Help: manual payment methods](https://help.shopify.com/en/manual/payments/manual-payments)
- For manual payments, the merchant clicks **Collect payment** on the order details page and chooses **Mark as paid**; status then becomes Paid and the order can be fulfilled as normal — [Avada guide (secondary)](https://avada.io/shopify/docs/how-mark-manual-payment-as-paid-shopify.html); [Shopify Help: manual payments](https://help.shopify.com/en/manual/payments/manual-payments); API equivalent mutation `orderMarkAsPaid` — [shopify.dev](https://shopify.dev/docs/api/admin-graphql/latest/mutations/orderMarkAsPaid.md)
- Card capture flow: in the **Authorized** section click **Capture payment**, optionally change the amount for a partial capture, click **Capture**. If the provider doesn't support multiple captures, merchant must "send the customer an invoice" and then manually mark as paid — [Shopify Help: capturing payments](https://help.shopify.com/en/manual/fulfillment/managing-orders/payments/capturing-payments)
- Deferred payments: merchants can set payment terms (net terms, due on fulfillment etc.) and send invoices due later; related topics include "waiving uncollected balances" — [Shopify Help: deferred payments](https://help.shopify.com/en/manual/orders/deferred-payments); [Shopify Help: payments overview](https://help.shopify.com/en/manual/fulfillment/managing-orders/payments/capture-payment)
- "Mark as paid" is **not** an orders bulk action (only "Capture order payments" is) — [Shopify Help: bulk actions](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/bulk-actions)

### Inferences
- For Noksa, model three separate enums rather than one "status" field: `order_status` {open, archived, canceled}, `payment_status` {pending, paid, partially_paid, refunded, partially_refunded, voided}, `fulfillment_status` {unfulfilled, in_progress, on_hold, partially_fulfilled, fulfilled}. **P0**. Authorized/Expiring/Expired/Due exist only because of card authorization and B2B terms; **P2** for a COD/bKash store.
- Payment method field (COD / bKash / Nagad / bank transfer) with an optional transaction ID (bKash TrxID) recorded at "Mark as paid" time is the key local adaptation; Shopify itself just treats these as "manual" with no reference field in the core flow. **P0**.
- "Mark as paid" should also exist as a bulk action in the custom admin (Shopify lacks it; COD courier remittances settle many orders at once). **P1**.
- Partial payment recording (e.g., advance delivery charge paid via bKash, balance on COD) is a common Bangladesh pattern; Shopify supports "Partially paid" via partial capture/manual capture. **P1**.
- Return status axis: **P2** (handle returns via note + refund for now).

### Gaps
- Could not get primary-source text for the exact "Collect payment" dialog (whether it allows entering a partial amount for manual payment methods, or a reference/ID field). Shopify Help page for pending payments redirected to an overview.
- No sourced info on how Shopify handles bKash/Nagad specifically (no evidence of native support; local gateways are third-party apps).

## 2. Orders list (columns, filters, saved views, search, bulk actions)

### Takeaway
The Orders index is a filterable, searchable table with saved views (tabs) and bulk actions; search covers order number, customer name, email and product; filters cover fulfillment status, payment status, sales channel, date, tags and metafields; bulk actions include fulfill, capture payments, print packing slips, archive/unarchive, cancel, add/remove tags.

### Cited Findings
- Search orders "using order numbers, customer names, email addresses, or product details" — [Shopify Help: viewing orders](https://help.shopify.com/en/manual/fulfillment/managing-orders/viewing-orders)
- Filters: fulfillment status, payment status, sales channel, date range, tags, order metafields — [Shopify Help: viewing orders](https://help.shopify.com/en/manual/fulfillment/managing-orders/viewing-orders)
- Saved views: "save frequently used filter combinations to quickly access orders that match specific criteria" — [Shopify Help: viewing orders](https://help.shopify.com/en/manual/fulfillment/managing-orders/viewing-orders)
- Desktop bulk actions on orders: Create and edit shipping labels, Fulfill orders, Capture order payments, Print packing slips, Archive orders, Unarchive orders, Cancel order, Add tags, Remove tags, Mark as in progress, Mark as unfulfilled, Request fulfillment, Cancel fulfillment request, plus app actions and Flow workflows. Mobile: shipping labels, fulfill, capture, Print orders, Print packing slips, archive/unarchive, add/remove tags — [Shopify Help: bulk actions](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/bulk-actions)
- Selection limits: desktop can select all across pages; mobile max 25 items — [Shopify Help: bulk actions](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/bulk-actions)
- Batch fulfillment (fulfill in batches up to 250 grouped by product type or destination) — reported as an October 2026 admin update — [consensus.pt (secondary)](https://consensus.pt/shopify/news/shopify-updates-october-2026/) via search summary; Shopify Help confirms orders can be fulfilled "individually, in bulk, or in batches" — [Shopify Help: fulfilling orders](https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/fulfill-orders)
- Packing slips can be printed for multiple orders from the Orders page via bulk actions — [Shopify Help: packing slips](https://help.shopify.com/en/manual/fulfillment/managing-orders/printing-orders/packing-slips/printing-packing-slips)

### Inferences
- Suggested column set for Noksa (mirrors standard Shopify list; exact Shopify defaults unverified): Order # (P0), Date (P0), Customer (P0), Total in BDT (P0), Payment status badge (P0), Fulfillment status badge (P0), Items count (P0), Payment method COD/bKash/Nagad (P0, local addition), Delivery method/zone e.g. Inside/Outside Dhaka (P1), Channel e.g. Web/Facebook/WhatsApp/Phone (P1, useful since many orders come via social), Tags (P1).
- Saved views / tabs: All, Unfulfilled, Unpaid, Open, Archived as fixed tabs is enough. **P0** for fixed tabs; custom user-saved views **P2**.
- Search by order #, customer name, phone, email. Phone search is more important than email in Bangladesh. **P0**.
- Filters: payment status, fulfillment status, date range **P0**; tags, channel **P1**; metafields **P2**.
- Bulk actions: Fulfill/mark shipped **P1**, Mark as paid **P1** (custom addition), Print packing slips/invoices **P1**, Archive **P1**, Add/remove tags **P2**, Cancel **P2**; shipping labels/fulfillment requests/Flow **P2** (no Shopify Shipping in BD; couriers like Pathao/Steadfast/RedX would be separate integrations).
- Pagination + sort by date desc is sufficient at this scale.

### Gaps
- Exact default column list and column-customization behavior in the 2026 Orders index could not be confirmed from primary text (Help pages returned overview only). From general product knowledge (unverified): Order, Date, Customer, Channel, Total, Payment status, Fulfillment status, Items, Delivery status, Delivery method, Tags are commonly shown.
- Exact names of default tabs in 2026 (historically All / Unfulfilled / Unpaid / Open / Archived) not confirmed from a primary source.

## 3. Order detail page (line items, payment summary, fulfill, edit, refund, cancel, archive, timeline, print)

### Takeaway
The order page combines line items with fulfillment cards, a payment summary with capture/collect actions, customer/contact/address cards, notes and tags, and a timeline; actions include fulfill, refund, return, edit, cancel, archive and print. Order editing allows adding/removing items, quantities, shipping fees, manual discounts and customer details, with automatic invoice-for-balance or refund handling. Line-item layout was redesigned in March 2026.

### Cited Findings
- Order editing: add/remove products, change quantities, shipping fees, apply/remove manual discounts, customer details; if more is owed merchant can "send the customer an updated invoice", if total drops merchant can "issue a refund"; edits affect "payments, fulfillment, and reporting"; Sidekick can draft edits for review — [Shopify Help: editing orders](https://help.shopify.com/en/manual/fulfillment/managing-orders/editing-orders)
- **Changed Mar 9, 2026**: new line-item design for orders and returns: consistent layout, clearer pricing and fee details, pricing grouped in a dedicated column with discount info on hover, collapsible metadata rows that remember preference — [Shopify Changelog](https://changelog.shopify.com/posts/improved-visual-hierarchy-for-line-items-in-orders-and-returns)
- **Changed 2026-10 API**: changing the shipping address on an unfulfilled order now recalculates taxes; new "requested order edit" objects (customer-requested edits merchants can resolve/decline) — [shopify.dev 2026-10 release notes](https://shopify.dev/changelog/release-notes/2026-10)
- Archived = order manually or auto archived; Canceled orders may still need refund work — [Shopify Help: order status](https://help.shopify.com/en/manual/fulfillment/managing-orders/order-status)
- Fulfillment can be done individually, in bulk, or in batches; labels can be bought/printed in admin with Shopify-supported carriers — [Shopify Help: fulfilling orders](https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/fulfill-orders)
- Packing slips printable per order and in bulk — [Shopify Help: packing slips](https://help.shopify.com/en/manual/fulfillment/managing-orders/printing-orders/packing-slips)
- Payment capture lives in the order details page (Capture payment / partial capture) — [Shopify Help: capturing payments](https://help.shopify.com/en/manual/fulfillment/managing-orders/payments/capturing-payments)

### Inferences
- Recommended page layout for Noksa (based on Shopify pattern; card labels unverified):
  - Header: Order #, date, payment badge, fulfillment badge, actions (Mark as paid, Fulfill, Print, More: Cancel, Archive). **P0**
  - Line items with image, title, variant, qty x unit price, line total; grouped under Unfulfilled / Fulfilled cards. **P0**
  - Payment summary: Subtotal, Discount, Shipping (delivery charge), Tax (likely zero/hidden for small BD store), Total, Paid by customer, Balance due. **P0** (tax **P2**)
  - Fulfill flow: select quantities, courier name (Pathao/Steadfast/RedX/Sundarban/self), tracking/consignment ID, "Notify customer" checkbox (SMS/WhatsApp more relevant than email). **P0** for mark-fulfilled + tracking; notify **P1**.
  - Customer card (name, phone, email, order count), shipping address, billing address (same-as-shipping default). **P0**
  - Notes (internal free text) **P0**; Tags **P1**.
  - Timeline of events (created, paid, fulfilled, edited) + staff comments **P1**.
  - Cancel order (with restock + reason) **P0**; Archive **P1** (can just be a status).
  - Refund (record manual refund amount + method) **P1**; Returns workflow **P2**.
  - Edit order (add/remove items, qty, delivery fee, discount after placement) **P1** — common when customers change orders over phone.
  - Print packing slip / invoice (with BDT, shop logo) **P1**.
  - Order risk analysis, conversion summary, Sidekick, shipping labels **P2**.

### Gaps
- Could not retrieve primary text describing exact order-detail card names, the fulfill dialog fields (tracking number, carrier auto-detect, "Send notification to customer" checkbox), or timeline behaviour (comments, @mentions, attachments, customer visibility). These help pages redirected to overviews. General knowledge (unverified): timeline comments are internal-only and support attachments; the fulfill dialog has tracking number + carrier + notify-customer checkbox.
- Cancel order options (refund, restock, reason, notify) not confirmed from primary text.

## 4. Draft orders (manual orders from phone/Facebook/WhatsApp)

### Takeaway
Draft orders let a merchant create an order on a customer's behalf (phone, email, in-person), add catalog or custom items, discounts, shipping, notes and tags, then get paid by sending an invoice/checkout link, entering a card, or marking as paid; paid drafts become regular orders. Since April 2025 inactive drafts auto-delete after a year. For a BD store selling largely through Facebook/WhatsApp this is arguably the most important feature.

### Cited Findings
- Purpose: manually create orders "on behalf of customers when you need to process orders through phone, email, or in-person sales"; once paid they convert into regular orders — [Shopify Help: draft orders](https://help.shopify.com/en/manual/fulfillment/managing-orders/create-orders)
- Capabilities: catalog products or custom line items, flexible pricing, line or order-level discounts, customer info, shipping address, tax, notes and tags — [Shopify Help: draft orders](https://help.shopify.com/en/manual/fulfillment/managing-orders/create-orders)
- Three ways to get paid: send invoice with secure checkout link; manually enter card; **Mark as paid** for payment already received — [Shopify Help: draft orders](https://help.shopify.com/en/manual/fulfillment/managing-orders/create-orders); [Getting paid for draft orders](https://help.shopify.com/manual/orders/create-orders/get-paid)
- **Changed 2025**: "Draft orders created on or after April 1, 2025, are automatically deleted after 1 year of inactivity. Any type of edit to the draft order resets the timer." — [Shopify Help: draft orders](https://help.shopify.com/en/manual/fulfillment/managing-orders/create-orders)
- **2026-07 API**: draft order deposits (Plus only) — [shopify.dev 2026-07 release notes](https://shopify.dev/changelog/release-notes/2026-07)
- Draft-order bulk actions (desktop): Delete, Add tags, Remove tags — [Shopify Help: bulk actions](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/bulk-actions)
- Abandoned checkouts can be converted into draft orders to preserve them — [Shopify Help: abandoned checkouts](https://help.shopify.com/en/manual/orders/abandoned-checkouts)

### Inferences
- For Noksa, simplest version: an "Create order" form in admin that directly creates a real order (skip a separate draft state): pick/search customer by phone or create inline, add products (+ custom item with free price), discount, delivery charge, payment method (COD/bKash/Nagad), payment status (unpaid / paid / advance paid), channel (Facebook/WhatsApp/Phone/Instagram), note. **P0**.
- Separate draft state + "send invoice/payment link" email: **P2** (customers in BD rarely pay via emailed checkout links; maybe a shareable order-summary link via WhatsApp is **P1**).
- Draft auto-expiry: **P2**.

### Gaps
- Draft order statuses (Open / Invoice sent / Completed) and inventory reservation behavior were not confirmed from primary text in this session.

## 5. Abandoned checkouts

### Takeaway
An abandoned checkout is a checkout where the customer entered contact info (email) but didn't complete payment after ~10 minutes; Shopify lists them with email/recovery status, supports manual and automated recovery emails, and deletes them after 3 months. Low relevance for a COD-heavy small store; skip.

### Cited Findings
- Definition: checkout "remains incomplete, even though the customer has provided their email information", flagged after >10 minutes — [Shopify Help: abandoned checkouts](https://help.shopify.com/en/manual/orders/abandoned-checkouts)
- List shows Email status and Recovery status; manual recovery via clicking customer email (recovery link pre-filled); automated via Apps > Messaging > Automations with configurable delay — [Shopify Help: abandoned checkouts](https://help.shopify.com/en/manual/orders/abandoned-checkouts)
- Auto-deleted after three months unless converted to draft orders — [Shopify Help: abandoned checkouts](https://help.shopify.com/en/manual/orders/abandoned-checkouts)
- **Recent change**: newer abandoned checkout experience is via the Shopify Messaging app, replacing the legacy flow — [Shopify Help: abandoned checkouts](https://help.shopify.com/en/manual/orders/abandoned-checkouts)

### Inferences
- **P2** for Noksa. If checkout captures phone early, a simple "incomplete checkouts" list to call/WhatsApp customers could be a later **P1** (BD shoppers often provide phone, not email).

### Gaps
- None material for this store.

## 6. Customers (list, detail, segments, creation, import/export)

### Takeaway
Customers list shows name, email subscription status, location, orders count and amount spent by default; the detail page has overview/contact, order history, addresses, internal notes, tags (up to 250), timeline, metafields; customers can be created manually, bulk-edited, merged, deleted/GDPR-erased, and imported/exported via CSV. Segments are rule-based ShopifyQL-driven dynamic lists — overkill for this store.

### Cited Findings
- Default list columns: name, email subscription status, location, orders, amount spent; columns customizable; segment export supported — [Shopify Help: customer segmentation](https://help.shopify.com/en/manual/customers/customer-segmentation); [Shopify Help: manage customers](https://help.shopify.com/en/manual/customers/manage-customers)
- Customer records created when people sign up for mailing lists/accounts, place orders, or abandon checkouts — [Shopify Help: manage customers](https://help.shopify.com/en/manual/customers/manage-customers)
- Manual add fields: first/last name, email (one per profile), phone, address, marketing consent checkbox, tax settings (VAT number, exemptions) — [Shopify Help: manage customers](https://help.shopify.com/en/manual/customers/manage-customers)
- Detail page: overview (contact + marketing), Orders history, Addresses (multiple, default), Notes (staff-only), Tags (up to 250), Timeline (incl. sent emails), Payment methods (subscriptions), Metafields — [Shopify Help: manage customers](https://help.shopify.com/en/manual/customers/manage-customers)
- Bulk edit (names, tags, marketing subscriptions), merge duplicates (restrictions for subscription/B2B/vaulted cards/store credit), erase personal data (GDPR) or delete (blocked by pending orders/subscriptions), send email — [Shopify Help: manage customers](https://help.shopify.com/en/manual/customers/manage-customers)
- Customer bulk actions (desktop & mobile): Delete selected, Add tags, Remove tags (+ Flow on desktop) — [Shopify Help: bulk actions](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/bulk-actions)
- Segments: "dynamic, rule-based customer lists" auto-updating; ShopifyQL filters like amount_spent, number_of_orders, last_order_date, location, email_subscription_status, customer_tags; used for insights, targeted marketing via Shopify Messaging, predicted spend tier — [Shopify Help: customer segmentation](https://help.shopify.com/en/manual/customers/customer-segmentation)
- CSV import/export referenced — [Shopify Help: manage customers](https://help.shopify.com/en/manual/customers/manage-customers)

### Inferences
- Customer list: Name, Phone (P0, primary identifier in BD), Email (P1, optional), Location/district (P1), Orders count (P0), Amount spent BDT (P0), Last order date (P1), Marketing subscription (P2). Search by name/phone. **P0**.
- Customer detail: contact info, order history with totals, addresses, internal notes **P0**; tags **P1**; timeline **P2**; marketing consent **P2** (unless running SMS campaigns); metafields **P2**.
- Manual customer creation (also inline within create-order) **P0**. Deduplicate by phone number (Shopify enforces one email per profile; Noksa should enforce unique phone) **P1**; merge tool **P2**.
- CSV export **P1** (useful for backups/Facebook custom audiences); import **P2**.
- Segments **P2**; a couple of simple filters (repeat customers, high spenders) **P1**.
- Delete customer / data erasure **P1** (good practice).

### Gaps
- Exact customer list default columns in 2026 vs "customizable columns" option set not fully enumerated.
- No 2025-2026 customer-admin changes found in sources reviewed.

## 7. Home dashboard and Analytics

### Takeaway
Home shows a 4-metric summary (defaults: Sessions, Total sales, Total orders, Conversion rate; user-customizable, with date range and channel selectors), a task list (payments to capture, orders to fulfill, returns, chargebacks), adaptive cards, AI "Insights" and Sidekick. Analytics overview has customizable, resizable metric cards updated within ~1 minute, period comparison, insights and metric targets; a session-measurement change in Sept 2026 shifted session-based metrics.

### Cited Findings
- Home metrics: defaults **Sessions, Total sales, Total orders, Conversion rate**; merchants can choose which 4 metrics, the date range and sales channels — [Shopify Help: Shopify Home](https://help.shopify.com/en/manual/shopify-admin/shopify-home)
- Home task list organized by category including payment captures, order fulfillment, returns processing and chargeback submissions — [Shopify Help: Shopify Home](https://help.shopify.com/en/manual/shopify-admin/shopify-home)
- Dynamic cards: feature updates, best practices, performance insights, Sidekick AI recommendations; Insights for stores averaging 10+ orders/week (up to 3 daily); activity globe on desktop; preferences per staff user — [Shopify Help: Shopify Home](https://help.shopify.com/en/manual/shopify-admin/shopify-home)
- Analytics page: "key sales, sessions, and fulfillment metrics for your store, updated within about 1 minute"; any date range, comparison periods; cards can be added/removed/rearranged/resized and grouped in sections; Insights; Metric targets — [Shopify Help: analytics overview](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/overview-dashboard)
- **Changed Sept 21-23, 2026**: session measurement update may change "sessions, conversion rate, and other session-based metrics" without real traffic change — [Shopify Help: analytics overview](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/overview-dashboard)

### Inferences
- Noksa Home (P0): KPI tiles for selected range (Today / 7 days / 30 days / custom): Total sales (BDT), Orders, Average order value; a to-do list: "X orders to fulfill", "X unpaid COD/bKash orders to confirm", "X orders awaiting delivery confirmation"; low-stock alert is owned by inventory researchers but a link card is cheap (P1).
- Comparison vs previous period (P1); sales-over-time line chart (P1); top products by units/revenue (P1); returning customer rate (P1); sales by channel (Facebook/WhatsApp/web) (P1, uniquely useful here); payment-method split COD vs bKash vs Nagad (P1).
- Sessions and conversion rate (P2): require analytics tracking; use a third-party tool (e.g., Plausible/GA) rather than building.
- Insights, metric targets, Sidekick, activity globe, customizable card layout, ShopifyQL reports (P2).

### Gaps
- Default list of Analytics overview cards (e.g., gross sales breakdown, returning customer rate, AOV, top products, sessions by device) could not be confirmed from primary text; page returned only feature summary.
- Plan-tier availability of reports (Basic vs higher) not confirmed.
- "Low stock" as a Home task was not mentioned in the Home help page text retrieved.

## 8. Essential vs advanced summary for this store

### Takeaway
P0 core = order list with payment/fulfillment status, order detail with Mark as paid + Fulfill (courier + tracking) + Cancel + notes, manual order creation, customer list/detail keyed on phone, and a Home with sales/orders/AOV and to-do counts. Most Shopify complexity (authorizations, payment terms, returns, segments, abandoned checkouts, labels, Flow, Sidekick, sessions) is P2.

### Cited Findings
- Manual payments are first-class in Shopify (Pending until "Mark as paid"), confirming COD/wallet flows fit the model — [Shopify Help: manual payments](https://help.shopify.com/en/manual/payments/manual-payments)
- Draft orders exist specifically for phone/email/in-person orders — [Shopify Help: draft orders](https://help.shopify.com/en/manual/fulfillment/managing-orders/create-orders)
- Home defaults (Sessions, Total sales, Total orders, Conversion rate) and to-dos (capture, fulfill, returns, chargebacks) — [Shopify Help: Shopify Home](https://help.shopify.com/en/manual/shopify-admin/shopify-home)

### Inferences
- P0: order enums (3 axes); orders list (tabs All/Unfulfilled/Unpaid/Open/Archived, search, status filters, date filter); order detail (items, totals, customer, addresses, note, mark as paid w/ method + reference, fulfill w/ courier + tracking, cancel); create order manually; customers list/detail/create; Home KPIs + to-dos.
- P1: edit order, refunds (manual record), print invoice/packing slip, tags, timeline, bulk mark-paid/fulfill/archive/print, partial payments (advance + COD), customer CSV export, period comparison & charts, top products, channel and payment-method breakdowns, customer notifications (SMS/WhatsApp/email).
- P2: authorizations/capture/expiry, payment terms, returns workflow, draft-state & invoice links, abandoned checkouts, segments, merge customers, marketing consent mgmt, metafields, risk analysis, shipping labels, Flow/automation, Sidekick/Insights, sessions/conversion analytics, multi-staff per-user preferences.

### Gaps
- Courier integration specifics for Bangladesh (Pathao, Steadfast, RedX APIs) are outside this research's scope and not covered.
