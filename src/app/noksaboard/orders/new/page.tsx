import type { Metadata } from "next";
import { getProducts } from "@/lib/products-server";
import { PageHeader } from "../../board-ui";
import { OrderForm } from "./order-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create order" };

export default async function NewOrderPage() {
  // Drafts can be sold here too (e.g. a custom piece not listed in the shop).
  const products = (await getProducts()).filter((p) => p.status !== "archived");
  return (
    <>
      <PageHeader title="Create order" back={{ href: "/noksaboard/orders", label: "Back to orders" }} />
      <OrderForm products={products} />
    </>
  );
}
