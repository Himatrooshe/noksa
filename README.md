# Noksa

A Next.js App Router storefront for Noksa’s handmade jute collection. The initial design follows the supplied reference, with cream, forest green, red accents, serif headings, and the supplied Noksa logo and hero backdrop. Product illustrations are temporary.

## Local development

Use Node.js 22 or newer and npm (the migration runner needs Node 22's built-in WebSocket).

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

The development command uses port 3000 explicitly and stops if that port is in use,
instead of silently starting another copy. For an intentional second server, use
`npm run dev -- --port 3001`.

```sh
npm run typecheck # TypeScript validation
npm test          # Deterministic regression tests (no database credentials needed)
npm run build     # Production build, including Next.js checks
npm start         # Serve the production build
```

Development output is stored in `.next-dev/<port>/`, while production builds use `.next/`.
This keeps builds and development servers on different ports from overwriting one another's route chunks.
The dashboard shows a loading state during navigation and offers a retry when a page fails to load.
The storefront reloads once when a route's JavaScript chunk fails to load, with a
60-second guard against reload loops and a manual reload screen if recovery fails.

## Structure

- `src/app/(storefront)/`: home, shop, product detail routes — its own root layout (header/footer/cart), independent of the dashboard.
- `src/app/noksaboard/`: the dashboard — its own root layout, no storefront chrome.
- `src/app/not-found.tsx`: top-level 404, required because there are two root layouts above (see "Multiple root layouts" in the Next.js docs).
- `src/components/`: navigation, footer, product grid, illustrations, icons, and shopping bag.
- `src/lib/products.ts`: client-safe product/category types and price formatting.
- `src/lib/products-server.ts`, `src/lib/orders-server.ts`: Postgres data access (catalog; orders, customers, home stats), server-only.
- `src/lib/products.ts`, `src/lib/orders.ts`: client-safe types and helpers.
- `src/lib/db.ts`: the Neon/Postgres connection (`DATABASE_URL`).
- `src/app/api/product-media/[id]/`: serves individual embedded product images as binary responses. Catalog lists carry image URLs instead of base64 data; draft and archived images require a dashboard session.
- `tests/`: regression tests using Node's built-in test runner and the existing TypeScript compiler.
- `src/lib/admin-session.ts`: the shared-login session (no user accounts).
- `db/migrations/`: numbered SQL migrations (`npm run db:migrate`); `db/seed.sql` holds optional sample data.
- `scripts/`: nightly backup scripts (DB → JSON, JSON → Google Sheets mirror).
- `public/`: Noksa logo and hero backdrop assets, plus the destination for future product photography.

## Current functionality

The home page includes a hero, collection, story, values, custom-order section, and contact footer. The shop supports category filters, each sample product has a detail page, and the shopping bag supports quantities, removal, and browser-local persistence. Navigation and the shopping bag work on mobile and with keyboard controls.

## Dashboard & database

For live releases, follow [production deployment](docs/PRODUCTION_DEPLOYMENT.md). The `npm run build:production` hosting build command runs pending migrations before building the app, including the initial published catalog with ImageKit URLs. Existing product edits and inventory are preserved.

Product photos are stored in ImageKit; the database holds their URLs and alt text. See [production image storage](docs/IMAGE_STORAGE.md) for server configuration, admin uploads, and the resumable embedded-image migration.

The catalog is backed by Neon (Postgres), with a dashboard at `/noksaboard`
for managing it — deliberately not `/admin` or linked from anywhere on the
public site, so it isn't an obvious guess. See `docs/ADMIN_SETUP.md` for
one-time setup (creating the project, running `npm run db:migrate`, and
configuring `.env.local`).

- `src/app/noksaboard/` — Home, Orders, Products, Collections and Customers
  management, styled as its own app shell (not the storefront's cream/serif
  look).
- Access control is a single shared login (`ADMIN_EMAIL` / `ADMIN_PASSWORD`),
  not per-user accounts — there's no shopper login on this site, so there's
  no user system to speak of; see `src/lib/admin-session.ts`. Gated by
  `src/middleware.ts`.
- Neon's free tier doesn't delete data for being idle (compute just
  auto-suspends and wakes on the next request), but a nightly GitHub Action
  (`.github/workflows/backup.yml`) is prepared to store encrypted database
  snapshots in `backups/encrypted/latest.json.enc`, with an optional Google
  Sheets mirror. Raw local JSON snapshots stay gitignored. See
  `docs/ADMIN_SETUP.md` for setup.

## Next phase

The store targets the US market and displays USD throughout the storefront, cart, and dashboard. Monetary database columns currently store whole US dollars (29 means $29.00, not 29 cents). The eight Drive-imported products use provisional prices and an initial stock of 10 each; review prices against actual costs and shipping before taking orders. Customer information pages now exist, with prelaunch wording; business contact details, shipping commitments, and purchase return terms remain to be finalized. Checkout, payments, and order *submission* are intentionally deferred (the `orders`/`order_items` schema and admin order view already exist, ready for when checkout ships).

## Customer pages & search indexing

Public routes: `/about`, `/contact`, `/faq`, `/shipping-policy`, `/refund-policy`,
`/privacy-policy`, and `/terms-and-conditions`. Copy lives in
`src/lib/information-content.tsx`; the shared layout is
`src/components/information-page.tsx`. Pages use the existing storefront header,
footer, and bag. Business details and purchase policies intentionally describe
the current prelaunch state rather than inventing operating terms. These pages
are a starting point, not a declaration that the business is ready for U.S. sales.

`/sitemap.xml` generates URLs for the home page, shop, all seven information
pages, and active product detail pages. Draft and archived products and the
dashboard are excluded. Catalog changes are reflected on the next request;
database failures return an error instead of a cached, incomplete sitemap.
`/robots.txt` advertises the sitemap and disallows `/noksaboard`. Dashboard pages
also retain their existing `noindex` metadata and authentication.

Set `SITE_URL` in the deployment environment to the canonical public origin,
including `https://` (no path), before submitting `/sitemap.xml` in Google Search
Console. Sitemap links and page canonicals share this setting. When it is unset,
the site uses the incoming request origin, so local development needs no domain
configuration. The Search Console verification metadata remains in the
storefront root layout.

Before opening checkout, replace prelaunch policy copy with the actual legal
business identity, public support contact, shipping origin/destinations/rates and
delivery times, return window and eligibility, return shipping responsibility,
refund timing, and cancellation terms. Review the live GTM container and update
privacy disclosures for the actual tags, providers, retention settings, and
applicable privacy controls. See [customer-page notes](docs/CUSTOMER_PAGES.md).

When adding checkout, validate prices and stock server-side rather than trusting the client, and keep writing orders through a server action or route handler rather than opening `orders`/`order_items` RLS policies to anonymous clients.

## Conventions

Use TypeScript strict mode, two-space indentation, PascalCase component exports, and kebab-case filenames. No test framework or formatter is configured yet. Verify the catalog filters, product routes, empty and populated bag, persistence, mobile menu, and unknown-product 404 after changes. Preserve the existing `AGENTS.md`.

## Backup configuration

See [backup setup and recovery](docs/ADMIN_SETUP.md#5-database-backups-and-google-sheets).
`npm run backup:check` checks Sheets without changing it; `npm run backup` creates
a fresh local JSON snapshot, encrypted archive, and Sheets mirror. The local
recovery key is `BACKUP_ENCRYPTION_KEY` in `.env.local`; keep a separate copy.
Nightly automation requires publishing the workflow to the default branch and
adding the five documented GitHub Actions secrets. Never commit raw database
snapshots to this public repository.
