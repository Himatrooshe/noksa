# Production product images

ImageKit stores product images. Neon stores HTTPS image references, alt text, and gallery ordering. Product and collection images must not be embedded as base64 data in database URL fields.

## Configuration

Set `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`, and `IMAGEKIT_PUBLIC_KEY` in `.env.local` and the production hosting environment. Example values are in `.env.example`. No key needs a `NEXT_PUBLIC_` prefix. The private key stays on the server; the current server upload flow does not use the public key for authentication.

Restart the local app after environment changes. Deploy the updated application and set the same variables on the host before using production uploads.

## Uploads

The product editor accepts source files up to 8 MB, resizes them in the browser, and sends the optimized file to `POST /api/admin/media`. The route requires an authenticated administrator and a same-origin request, bounds the request body to 2 MB, and checks the raster file signature and 1.5 MB file limit. SVG/HTML content is rejected. The upload helper calls ImageKit using server-side Basic authentication and returns only public file metadata.

The product form saves the returned HTTPS URL. Failed uploads do not add an image, and saving is disabled during the upload. Removing an image from a form does not delete the remote asset, because another product or collection may still use it. Review unused assets in ImageKit before deleting them.

The storefront requests responsive ImageKit image sizes; product grids and gallery thumbnails use smaller versions than full product photos.

## Existing-image migration

Use Node.js 22 or newer:

```sh
node --env-file=.env.local scripts/migrate-images-to-imagekit.mjs
node --env-file=.env.local scripts/migrate-images-to-imagekit.mjs --apply
```

The first command inspects only. The second backs up embedded references under ignored `backups/imagekit-migration/`, deduplicates files by SHA-256, uploads them under `/noksa/catalog`, and verifies each original file via ImageKit's `orig-true` delivery parameter. Database URLs change only after all uploads are verified. Compare-and-set updates preserve edits made concurrently by an administrator. A checkpoint with ImageKit file IDs allows the migration to resume after an interrupted upload. A completed migration can be rerun and finds no embedded references.

Keep the ignored `before-*.json` snapshot and `uploads.json` checkpoint for rollback or audit. Do not commit them. To roll back a reference, restore its snapshot URL only when the current URL still matches that hash's checkpoint URL; this avoids overwriting subsequent product edits. Keep ImageKit files while any product or collection references them.

## Verification

```sh
npm test
npm run typecheck
npm run build
```

Unit tests validate file rejection, size limits, server authentication, and safe provider-error handling without using real credentials.

## Completed migration and validation

The catalog migration replaced 57 product media URLs and four collection cover URLs with ImageKit URLs. The 61 references use 56 unique files after deduplication. Every original file matched its source SHA-256; a subsequent dry run found zero embedded images.

Validation passed: eight automated tests, TypeScript validation, and the production build. A Chrome check against the local production build verified a real authenticated upload, loaded preview, a CDN URL in the form payload, and rejection of unauthorized (401), cross-origin (403), invalid-file (400), and oversized-body (413) requests. The temporary test upload was deleted without saving a product. A public storefront check loaded all eight product cover images and switched a gallery photo successfully, with no page errors. The production shop HTML response was about 55 KB, versus the earlier 29.9 MB embedded-image response. A client-bundle scan confirmed the configured private key was absent.

These checks were local; production deployment and production environment-variable configuration are separate hosting steps.
