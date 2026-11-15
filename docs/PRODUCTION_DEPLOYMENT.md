# Production deployment

The production app uses the same Neon database as local development. The eight catalog products are already published in that database. Deploying the updated app makes it read the same records; do not import another copy or reset inventory during deployment.

Migration `003_initial_published_catalog.sql` has been applied successfully to this shared database after a full backup. The backup is in `backups/2026-11-15T21-36-18-031Z/` (ignored by Git), with the latest snapshot also under `backups/latest/`. Fresh-database and partial-catalog PostgreSQL checks passed, along with automated tests, TypeScript validation, and the production build. Live deployment itself remains the hosting release step.

## Hosting configuration

Set these environment variables in the production environment:

- `DATABASE_URL`: the same Neon connection string used by `.env.local`.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`: the admin credentials/session secret.
- `IMAGEKIT_URL_ENDPOINT`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_PUBLIC_KEY`: the configured ImageKit account. The private key must stay server-side.
- `SITE_URL`: the canonical HTTPS origin of the live store.

Use Node.js 22 or newer. Install with `npm ci`. Set the hosting build command to:

```sh
npm run build:production
```

This runs pending database migrations before `next build` and stops the deployment build if migration fails. Use it for production release jobs. The ordinary `npm run build` remains a compilation-only command for local and preview builds.

For a Node server host, start the built app with `npm start`. Hosts with native Next.js support use their own runtime. Keep existing production access settings and domains.

## Catalog migration

`db/migrations/003_initial_published_catalog.sql` contains the four collections, eight Active products, eight default variants, 57 gallery images, and collection assignments. All image references are public ImageKit URLs; there are no embedded images or credentials in the SQL.

New variants start with stock 10 and the owner-approved provisional USD prices: fanny bags $29, sling bags $24, totes $32, Long grocery bag $22, Square grocery bag $24. Values are whole US dollars. Existing product titles, descriptions, visibility, prices, inventory, and images are preserved.

The migration resolves product slugs and collection handles, so matching records with different database IDs can be reused. It runs once through `schema_migrations`. Replaying its SQL does not reset sold stock or later admin edits. An advisory lock serializes overlapping migration jobs.

Before applying new migrations to a database with real data, run:

```sh
npm run backup:db
npm run db:migrate
```

Environment-provided `DATABASE_URL` takes precedence over `.env.local`; this lets a hosting job use its configured database without copying local secrets. Do not run legacy `--seed` sample data for production.

## Validation

```sh
npm test
npm run typecheck
npm run db:check-catalog
npm run build
```

`db:check-catalog` requires database access. It creates isolated test schemas inside transactions and rolls them back, checking a fresh database and a partially populated one. It verifies image URLs, relationship counts, and preservation of prices, stock, content, status, and gallery edits when replayed.

After deployment, visit `/shop` and confirm eight products appear with USD prices, loaded images, and available Add to bag buttons. Open a product and change its gallery photo. Visit `/noksaboard` and confirm the products remain Active. Stock is live inventory and can differ from its initial quantity after sales or admin edits.
