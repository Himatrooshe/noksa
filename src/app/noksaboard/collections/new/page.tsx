import type { Metadata } from "next";
import { ActionForm } from "../../action-form";
import { Card, PageHeader } from "../../board-ui";
import { CollectionFields } from "../collection-fields";
import { saveCollectionAction } from "../actions";

export const metadata: Metadata = { title: "Create collection" };

export default function NewCollectionPage() {
  return (
    <>
      <PageHeader title="Create collection" back={{ href: "/noksaboard/collections", label: "Back to collections" }} />
      <Card>
        <ActionForm action={saveCollectionAction.bind(null, null)} submitLabel="Save collection">
          <CollectionFields />
        </ActionForm>
      </Card>
    </>
  );
}
