"use client";

/** A submit button that asks for confirmation before its form actually submits. */
export function ConfirmSubmitButton({
  confirmMessage,
  className = "board-link-button danger",
  children,
}: {
  confirmMessage: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
