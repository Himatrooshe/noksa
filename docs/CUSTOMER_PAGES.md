# Customer information pages

The seven public information pages describe the browsing-only store. The owner
has deferred business details and purchase terms. Keep the prelaunch wording
until those details are provided; do not publish fictional addresses, support
channels, shipping promises, or refund windows.

Edit copy in `src/lib/information-content.tsx`. Each page has its own explicit
route and canonical URL. The route list in `src/lib/storefront-pages.ts` is shared
by the information page navigation and the sitemap. Policy update dates are displayed
by `src/components/information-page.tsx`; update that date when policies change.

## Completing the pages later

- Contact: legal business name, public business address, support email or phone,
  support hours, and a working route for privacy requests.
- Shipping: fulfillment origin, supported destinations and exclusions, processing
  and transit estimates, rates, taxes/duties where relevant, tracking, and the
  procedure for delays or lost/damaged shipments.
- Returns/refunds: request window, item condition, exclusions, return process and
  address, who pays shipping, any fees, refund method and timing, cancellations,
  and remedies for defective or incorrect items.
- Privacy: actual service providers and GTM container tags, data categories and
  recipients, retention, applicable consumer rights, request handling, and any
  required tracking choices. The current copy explicitly discloses the bag’s
  local storage and the absence of a consent banner/Do Not Track handling.
- Terms: actual operator and purchase conditions when checkout is implemented.

## Sitemap setup

Set `SITE_URL` to the public canonical origin in deployment environment variables.
Without it, the site uses the request origin; this is convenient locally but
does not normalize production domain aliases or preview deployments.

After deployment, check `/sitemap.xml` and `/robots.txt` on the public domain,
then submit `/sitemap.xml` in Search Console. Sitemap submission does not itself
guarantee indexing or Merchant Center approval. The sitemap omits `lastmod`
because no reliable page modification timestamps are currently tracked.

## References

- [Google Merchant Center website functionality requirements](https://support.google.com/merchants/answer/12056511?hl=en)
  explain contact information and customer policy expectations. A browsing-only
  store still needs a functioning purchase flow before merchant review.
- [Google’s return and refund policy guidance](https://support.google.com/merchants/answer/12471690?hl=en)
  explains the need for clear conditions and timelines consistent across the site.
- [FTC shipping rule](https://www.ftc.gov/legal-library/browse/rules/mail-internet-or-telephone-order-merchandise-rule)
  covers shipment promises, the default shipment period when none is stated,
  and delay consent/refunds. Confirm fulfillment commitments before taking payment.
- [California DOJ privacy guidance](https://oag.ca.gov/sites/all/files/agweb/pdfs/cybersecurity/making_your_privacy_practices_public.pdf)
  describes disclosures for applicable websites, including tracking practices.
- [Next.js sitemap convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
  documents the metadata route used here.
