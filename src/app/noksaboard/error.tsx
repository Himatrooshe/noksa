"use client";

export default function BoardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="board-card board-card-pad" role="alert">
      <h1 className="board-title">This page couldn’t load</h1>
      <p>Try again, or choose another page from the sidebar.</p>
      <button type="button" className="board-button board-button-primary" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
