import type { Metadata } from "next";
import Script from "next/script";
import { CartProvider } from "@/components/cart-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getProducts } from "@/lib/products-server";
import { getSiteUrl } from "@/lib/site-url";
import "../globals.css";
// Always fetch fresh from the database. Without this, Next.js can
// prerender the catalog once at build time and never update it, so
// dashboard edits (product/stock/category changes) wouldn't show up until
// a rebuild.
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: await getSiteUrl(),
    title: { default: "Noksa — The Art of Sustainable Living", template: "%s | Noksa" },
    description:
      "Discover Noksa: handmade jute bags, home essentials, and thoughtful accessories inspired by Bangladesh’s golden fiber.",
    verification: {
      google: "2SKFcm1gYCsbcn0iKrMJPypI5Cv6CXzBLX6PdF9tVM4",
    },
  };
}
export default async function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const products = await getProducts({ status: "storefront" });
  const cartProducts = products.map(({ id, slug, name, trackInventory, continueSelling, options, variants }) => ({
    id, slug, name, trackInventory, continueSelling, options,
    variants: variants.map(({ id, title, price, stock }) => ({ id, title, price, stock })),
  }));
  return (
    <html lang="en">
      <head>
        <Script id="google-tag-data-layer" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          `}
        </Script>
      </head>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtm.js?id=GTM-T4RZBTK8"
          strategy="afterInteractive"
        />
        <CartProvider products={cartProducts}>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
