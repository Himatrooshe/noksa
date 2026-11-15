/** Public information routes shared by page navigation and the sitemap. */
export const storefrontPages = [
  { slug: "about", title: "About Noksa" },
  { slug: "contact", title: "Contact" },
  { slug: "faq", title: "Frequently asked questions" },
  { slug: "shipping-policy", title: "Shipping policy" },
  { slug: "refund-policy", title: "Returns & refunds" },
  { slug: "privacy-policy", title: "Privacy policy" },
  { slug: "terms-and-conditions", title: "Terms & conditions" },
] as const;

export type StorefrontPageSlug = (typeof storefrontPages)[number]["slug"];
