import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const { cancelled } = await searchParams;
  return (
    <main id="main-content" className="container checkout-page">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/shop">Shop</Link>
        <span aria-hidden="true">/</span>
        <span>Checkout</span>
      </nav>
      <header className="checkout-heading">
        <p className="eyebrow">Almost yours</p>
        <h1>
          Check<span>out</span>
        </h1>
      </header>
      <CheckoutForm cancelled={cancelled === "1"} />
    </main>
  );
}
