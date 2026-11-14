# Noksa

A Next.js App Router storefront for Noksa’s handmade jute collection. The initial design follows the supplied reference, with cream, forest green, red accents, serif headings, and the supplied Noksa logo and hero backdrop. Product illustrations are temporary.

## Local development

Use Node.js 20.9 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

```sh
npm run typecheck # TypeScript validation
npm run build     # Production build, including Next.js checks
npm start         # Serve the production build
```

Development output is stored in `.next-dev/`, while production builds use `.next/`.
This keeps `npm run build` from replacing chunks used by a running development server.

## Structure

- `src/app/`: home, shop, product detail, and not-found routes; global styles and layout.
- `src/components/`: navigation, footer, product grid, illustrations, icons, and shopping bag.
- `src/lib/products.ts`: typed sample catalog and price formatting; the future backend integration point.
- `public/`: Noksa logo and hero backdrop assets, plus the destination for future product photography.

## Current functionality

The home page includes a hero, collection, story, values, custom-order section, and contact footer. The shop supports category filters, each sample product has a detail page, and the shopping bag supports quantities, removal, and browser-local persistence. Navigation and the shopping bag work on mobile and with keyboard controls.

## Next phase

Catalog entries, BDT prices, dimensions, copy, and illustrations are sample content. Confirm these before launch. Contact information, shipping policies, and return terms are pending. Checkout, payments, order persistence, authentication, database, and backend admin are intentionally deferred. No orders are submitted by this version.

Keep catalog access on the server when adding the backend, validate prices and stock server-side at checkout, and protect all future admin routes and mutations. Put secrets in ignored environment files and provide placeholder examples only.

## Conventions

Use TypeScript strict mode, two-space indentation, PascalCase component exports, and kebab-case filenames. No test framework or formatter is configured yet. Verify the catalog filters, product routes, empty and populated bag, persistence, mobile menu, and unknown-product 404 after changes. Preserve the existing `AGENTS.md`.
