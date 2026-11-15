export default function BoardLoading() {
  return (
    <section className="board-page-loading" role="status" aria-live="polite" aria-busy="true">
      <p>Loading dashboard page…</p>
      <div className="board-loading-heading" aria-hidden="true" />
      <div className="board-loading-content" aria-hidden="true" />
    </section>
  );
}
