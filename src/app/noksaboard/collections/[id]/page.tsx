import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollectionById, getCollectionProducts } from "@/lib/products-server";
import { ActionForm } from "../../action-form";
import { Card, PageHeader, ProductStatusBadge } from "../../board-ui";
import { ConfirmSubmitButton } from "../../confirm-submit-button";
import { CollectionFields } from "../collection-fields";
import { deleteCollectionAction, saveCollectionAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Collection" };

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collection = await getCollectionById(id);
  if (!collection) notFound();
  const products = await getCollectionProducts(id);

  return (
    <>
      <PageHeader title={collection.title} back={{ href: "/noksaboard/collections", label: "Back to collections" }} />
      <div className="board-editor-grid">
        <div className="board-editor-main">
          <Card>
            <ActionForm action={saveCollectionAction.bind(null, collection.id)} submitLabel="Save">
              <CollectionFields collection={collection} />
            </ActionForm>
          </Card>
          <Card title={`Products (${products.length})`}>
            {products.length === 0 ? (
              <p className="board-hint">
                No products yet. Open a product and tick this collection in its sidebar.
              </p>
            ) : (
              <ul className="board-plain-list">
                {products.map((p) => (
                  <li key={p.id}>
                    <Link href={`/noksaboard/products/${p.id}`}>{p.name}</Link>
                    <ProductStatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
      <div className="board-danger-zone">
        <form action={deleteCollectionAction.bind(null, collection.id)}>
          <ConfirmSubmitButton
            className="board-button board-button-danger"
            confirmMessage={`Delete "${collection.title}"? Its products stay; they just leave this collection.`}
          >
            Delete collection
          </ConfirmSubmitButton>
        </form>
      </div>
    </>
  );
}
