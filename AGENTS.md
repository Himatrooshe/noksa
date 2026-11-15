# Repository Guidelines

## Project Structure & Module Organization

The Next.js App Router app lives in `src/app/`, with independent storefront and dashboard root layouts. Shared UI lives in `src/components/`; server data access and client-safe helpers live in `src/lib/`. Static assets live in `public/`, database migrations in `db/migrations/`, operational scripts in `scripts/`, and setup notes in `docs/`. Standalone regression tests live in `tests/`. Avoid creating empty directories solely to match this layout.

## Build, Test, and Development Commands

Use Node.js 22 or newer and npm with the committed `package-lock.json`. Run `npm ci` to install, `npm run dev` for local development, `npm run build` for a production build, `npm start` to serve it, `npm run typecheck` for TypeScript validation, and `npm test` for deterministic Node test runner checks. No standalone lint or formatter command is configured. Development output uses `.next-dev/<port>/` to isolate concurrent servers; production output uses `.next/`.

Production release builds use `npm run build:production` (migrations, then build). `npm run db:check-catalog` validates catalog SQL in isolated PostgreSQL schemas and rolls back every test; it requires database access. Deployment instructions live in `docs/PRODUCTION_DEPLOYMENT.md`.

Backup commands: `npm run backup:check` validates Sheets access without changes; `npm run backup` creates local JSON, an encrypted archive, and the Sheets mirror. `npm run backup:db`, `npm run backup:encrypt`, `npm run backup:sheets`, and `npm run backup:decrypt` run each stage independently. Raw backup JSON is gitignored; only encrypted snapshots may be committed. See `docs/ADMIN_SETUP.md` for secrets, scheduling, and recovery.

## Coding Style & Naming Conventions

Follow the idioms of the language and framework introduced by the project. Configure a formatter and linter early, and use their configuration as the source of truth for indentation and formatting. Use descriptive names, consistent filename casing within each module, and small modules with clear responsibilities. Keep unrelated formatting changes out of functional patches.

## Testing Guidelines

Use Node's built-in test runner (`tests/*.test.cjs` and `tests/*.test.mjs`, run with `npm test`). No coverage threshold is established. Prioritize observable behavior, failure paths, and regression cases. Keep tests deterministic and independent of production credentials or services.

## Commit & Pull Request Guidelines

No Git history is available to establish an existing commit convention. Use concise, imperative commit subjects, such as `Add initial application scaffold`. Keep changes focused. Pull requests should explain the purpose, summarize changes, link relevant issues, and report validation performed. Include screenshots for visual changes and call out configuration or migration requirements.

## Security & Configuration

Never commit credentials, private keys, or local environment files. Provide placeholder configuration examples when needed and document required environment variables without exposing secrets.
