import type { Collection } from "@/lib/products";

/** Fields shared by the create and edit collection forms. */
export function CollectionFields({ collection }: { collection?: Collection }) {
  return (
    <>
      <label className="board-field">
        Title
        <input className="board-input" name="title" required defaultValue={collection?.title} placeholder="Summer collection" />
      </label>
      <label className="board-field">
        Description
        <textarea className="board-input" name="description" rows={4} defaultValue={collection?.description} />
      </label>
      <label className="board-field">
        Image URL
        <input
          className="board-input"
          name="imageUrl"
          type="url"
          defaultValue={collection?.imageUrl ?? ""}
          placeholder="Optional — https://…"
        />
      </label>
      <label className="board-field">
        URL handle
        <input
          className="board-input"
          name="handle"
          defaultValue={collection?.handle}
          placeholder="Generated from the title if left blank"
        />
      </label>
    </>
  );
}
