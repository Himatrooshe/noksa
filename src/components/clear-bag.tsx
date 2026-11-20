"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-provider";

/** Empties the bag once an order exists, and re-checks payment while Stripe confirms it. */
export function ClearBag({ pending }: { pending: boolean }) {
  const { clear, ready } = useCart();
  const router = useRouter();
  useEffect(() => {
    if (ready) clear();
    // `clear` is recreated each render; running once the bag has loaded is enough.
  }, [ready]);
  useEffect(() => {
    if (!pending) return;
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      router.refresh();
      if (tries >= 10) clearInterval(timer);
    }, 3000);
    return () => clearInterval(timer);
  }, [pending, router]);
  return null;
}
