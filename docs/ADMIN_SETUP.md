# Dashboard & database setup

One-time setup to get the dashboard (at `/noksaboard` — not `/admin`, and
not linked from anywhere on the public site) talking to a real database,
plus the automated backups that protect the free-tier data.

## 1. Create the Neon project

1. Go to <https://neon.tech>, sign up free, create a project.
2. Neon's free tier suspends the compute instance after a few minutes of
   inactivity (it wakes back up automatically on the next request, a short
   delay) but does **not** delete data for being idle — that's why it was
   picked over alternatives that pause/archive free projects after a week.
3. In the Neon dashboard, copy the **pooled** connection string (labeled
   "Connection string", with `-pooler` in the hostname). You'll need it in
   step 3.

## 2. Create the tables

After filling in `DATABASE_URL` (step 3), run:

```sh
npm run db:migrate            # applies db/migrations/*.sql in order
```

Migration 003 supplies the eight published US-market products, collections,
and their ImageKit image URLs. Do not use the legacy `--seed` sample data
for production. See [production deployment](PRODUCTION_DEPLOYMENT.md) for
the release build command and required hosting environment variables.

Each file in `db/migrations/` runs once per database, inside a transaction,
and is recorded in a `schema_migrations` table — so it's always safe to run
`npm run db:migrate` again (e.g. after pulling new code). Needs Node 22+.
To change the schema later, add a new numbered file rather than editing an
old one. **Run `npm run backup:db` before migrating a database with real
data.**

The schema is Shopify-shaped: `products` with `product_variants` (every
product has at least one; price, compare-at price, SKU and stock live on
the variant), `product_options`, `product_media`, `collections`,
`customers` (keyed by phone number), and `orders` with separate payment and
fulfillment statuses plus an `order_events` timeline. A database trigger
refuses any stock change that would oversell a tracked product. No per-user
tables and no Row Level Security — access control happens in the app (step
3).

## 3. Configure the app

1. Copy `.env.example` to `.env.local`.
2. `DATABASE_URL` — the connection string from step 1.
3. `ADMIN_EMAIL` + `ADMIN_PASSWORD` — pick real values. This login is the
   **only** thing standing between the public internet and your
   product/order data, so don't use something guessable. There are no
   separate per-user accounts — one shared email+password pair unlocks
   `/noksaboard` for whoever has it.
4. `ADMIN_SESSION_SECRET` — a random string used to sign the login session
   cookie. Generate one with `openssl rand -hex 32`. Changing this later
   instantly logs everyone out (it invalidates all existing session
   cookies) — handy if the password ever leaks.
5. `npm run dev`, visit `/noksaboard/login`, sign in.
6. If you deploy, set `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and
   `ADMIN_SESSION_SECRET` in that host's environment variable settings too.

**Never put real values in `.env.example`** — it's the tracked template
file (committed to git); real secrets go only in `.env.local` (gitignored).

**On the "secret passage" design:** `/noksaboard` isn't linked from the
storefront, isn't indexed (`robots: noindex`), and middleware redirects any
unauthenticated visit straight to the login screen. That makes it
unlisted, not actually secret — the URL itself isn't a security boundary.
The email+password pair is the real gate; keep it off of other sites and
don't reuse it elsewhere.

## 4. Day-to-day use

- **Home** — sales, order count and average order value for a date range,
  plus a to-do list (orders to ship, awaiting payment, out for delivery,
  low stock) and top products.
- **Products** — All/Active/Draft/Archived tabs, search by title or SKU,
  bulk status change/delete. The editor has title, rich-text description,
  images (ImageKit uploads or URLs, reorderable, with alt text), USD price and
  compare-at price, stock tracking ("continue selling when out of stock"
  for made-to-order), up to 3 options (e.g. Size, Color) that generate
  variants with their own price/SKU/stock, status, collections, and URL
  handle. A save bar appears on unsaved changes.
- **Collections** — groups shown as the shop's filter buttons. Assign
  products from the product editor's sidebar.
- **Orders** — record phone/Facebook/WhatsApp orders with **Create order**
  (stock is deducted immediately; returning customers are recognised by
  phone). On an order: mark paid (COD/bKash/Nagad/bank, with transaction
  ID), mark shipped (courier + tracking ID), mark delivered, cancel (with
  optional restock), refund, archive, notes and a comment timeline.
- **Customers** — created automatically from orders; order history,
  lifetime spend, editable details and notes.

Not built yet: online checkout, bulk "mark as paid", stock-adjustment history, cost/margin,
and SEO title/description fields.

## 5. Database backups and Google Sheets

Local configuration lives in `.env.local`; GitHub Actions needs its own repository
secrets. Adding variables to your hosting provider does not configure GitHub.

### Google Sheets connection

1. Enable the **Google Sheets API** in the service account's Google Cloud project.
2. Share the target spreadsheet with `GOOGLE_SERVICE_ACCOUNT_EMAIL` as an
   **Editor**. Keep the spreadsheet restricted; it can contain customer/order data.
3. Set `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, and `GOOGLE_SHEET_ID`
   in `.env.local`. Use only the ID between `/d/` and `/edit` in the spreadsheet
   URL. The key can contain actual newlines or literal `\n` sequences.
4. Run `npm run backup:check`. This reads spreadsheet metadata without changing it.
5. Run `npm run backup` for a fresh database snapshot, encrypted archive, and
   Sheets mirror. The mirror creates ten business-table tabs with frozen headers.
   Other tabs are left alone. Existing business-table values are replaced, so
   these tabs should be dedicated to the mirror rather than manual editing.

The Sheets write is one atomic batch: if any request fails, none of the tabs are
changed. Literal phone numbers/IDs and text starting with `=` remain text. Cells
above 50,000 characters are rejected before any write; large embedded images
belong in JSON backups, with hosted image URLs used in the mirror.

Google Sheets is a readable mirror, not the restore source. JSON files in
`backups/latest/` and timestamped directories preserve the complete business
records. Those unencrypted directories are gitignored.

### Encrypted archive and recovery key

`BACKUP_ENCRYPTION_KEY` is a unique 64-character hexadecimal value in `.env.local`.
If configuring a new installation, generate a value with `openssl rand -hex 32`,
then store it there and in your password manager. Never commit or paste it into
logs. The existing local setup already has a generated key; preserve it.

`npm run backup:encrypt` creates `backups/encrypted/latest.json.enc` from the latest
JSON snapshot using AES-256-GCM authenticated encryption and a fresh random nonce.
Only this encrypted file is eligible for commit to the public repository.
Keep a separate recovery copy of the key: losing it makes encrypted snapshots
unrecoverable. Changing it requires retaining the old key for old snapshots.

### Daily automation

The prepared workflow `.github/workflows/backup.yml` runs at **18:00 UTC / midnight
Bangladesh time**, or manually via **Actions → Database backup → Run workflow**.
GitHub can delay scheduled runs. It runs only after the workflow is published to
the repository's default branch; local files alone do not enable automation.

In [repository Actions secrets](https://github.com/Himatrooshe/noksa/settings/secrets/actions),
a repository owner or an authorized collaborator must add these exact names:

| Secret | Value |
| --- | --- |
| `DATABASE_URL` | The same database connection as `.env.local` |
| `BACKUP_ENCRYPTION_KEY` | The same recovery key as `.env.local` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | The configured service account email |
| `GOOGLE_PRIVATE_KEY` | The configured private key, including PEM markers |
| `GOOGLE_SHEET_ID` | The configured spreadsheet ID |

GitHub authentication must have permission to manage repository Actions secrets.
The workflow requires the first two secrets; if any Google secret is absent, it
stores the encrypted backup and reports that Sheets is skipped. If the Google
API fails, the encrypted backup has already been saved, and the job fails visibly
so the mirror issue can be investigated. Keep Actions failure notifications on.
Branch rules must allow the workflow token to push its encrypted backup commit.
An encrypted workflow artifact is also retained for 30 days before the push, so
a branch-rule or push failure still leaves a downloadable encrypted snapshot.

This setup is **not active nightly until published and the secrets are set**.
No raw database files should be committed or uploaded as public workflow artifacts.

### Commands

```sh
npm run backup:check    # read-only Google Sheets connection check
npm run backup:db       # read database into local JSON snapshots
npm run backup:encrypt  # encrypt the latest JSON snapshot
npm run backup:sheets   # mirror the latest JSON snapshot into Sheets
npm run backup          # fresh JSON, encrypted archive, then Sheets
npm run backup:decrypt  # extract the encrypted snapshot to backups/restored/
```

For recovery, obtain the encrypted file from the desired Git commit and use the
matching recovery key. The decryption command authenticates the entire file
before extraction and refuses to overwrite an existing directory:

```sh
npm run backup:decrypt -- --input backups/encrypted/latest.json.enc --output backups/recovered-copy
```

This writes the ten original JSON files locally; it does **not** modify a database.
Restoring those records into a database remains a separate, reviewed operation
using the migrations and parent-before-child table order in `scripts/fetch-tables.mjs`.
Schema definitions and historical product image binaries hosted outside the database
are not included; maintain the application/migrations and image-host account too.

References: [Google's atomic batch update behavior](https://developers.google.com/workspace/sheets/api/guides/batchupdate),
[GitHub repository secret setup](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets).
