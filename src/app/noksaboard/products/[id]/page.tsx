import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollections, getProductById } from "@/lib/products-server";
import { PageHeader, ProductStatusBadge } from "../../board-ui";
import { ConfirmSubmitButton } from "../../confirm-submit-button";
import { ProductEditor } from "../product-editor";
import { deleteProductAction, saveProductAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const [product, collections] = await Promise.all([getProductById(id), getCollections()]);
  if (!product) notFound();

  return (
    <>
      <PageHeader
        title={product.name}
        back={{ href: "/noksaboard/products", label: "Back to products" }}
        badges={<ProductStatusBadge status={product.status} />}
      />
      {created && <p className="board-banner board-banner-success">Product created.</p>}
      <ProductEditor
        // Remount with fresh state whenever the saved product changes.
        key={product.id}
        product={product}
        collections={collections}
        action={saveProductAction.bind(null, product.id)}
      />
      <div className="board-danger-zone">
        <form action={deleteProductAction.bind(null, product.id)}>
          <ConfirmSubmitButton
            className="board-button board-button-danger"
            confirmMessage={`Delete "${product.name}"? This can't be undone. Past orders keep their line items.`}
          >
            Delete product
          </ConfirmSubmitButton>
        </form>
      </div>
    </>
  );
}
