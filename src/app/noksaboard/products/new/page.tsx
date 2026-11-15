import type { Metadata } from "next";
import { getCollections } from "@/lib/products-server";
import { PageHeader } from "../../board-ui";
import { ProductEditor } from "../product-editor";
import { saveProductAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage() {
  const collections = await getCollections();
  return (
    <>
      <PageHeader title="Add product" back={{ href: "/noksaboard/products", label: "Back to products" }} />
      <ProductEditor collections={collections} action={saveProductAction.bind(null, null)} />
    </>
  );
}
