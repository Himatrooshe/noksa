import type { Metadata } from "next";
import { CartProvider } from "@/components/cart-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Noksa — The Art of Sustainable Living", template: "%s | Noksa" },
  description:
    "Discover Noksa: handmade jute bags, home essentials, and thoughtful accessories inspired by Bangladesh’s golden fiber.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
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
