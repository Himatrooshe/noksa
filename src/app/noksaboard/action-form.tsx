"use client";
import { useActionState, type ReactNode } from "react";

export type ActionResult = { error?: string; ok?: string } | undefined;
export type FormAction = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

/**
 * A form bound to a server action that returns `{ error }` / `{ ok }`,
 * showing the result inline. Optional `confirm` asks before submitting.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Saving…",
  variant = "primary",
  confirm,
  className = "board-form",
}: {
  action: FormAction;
  children?: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  confirm?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const buttonClass =
    variant === "primary"
      ? "board-button board-button-primary"
      : variant === "danger"
        ? "board-button board-button-danger"
        : "board-button";
  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
    >
      {children}
      {state?.error && (
        <p className="board-error" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="board-success" role="status">
          {state.ok}
        </p>
      )}
      <div>
        <button className={buttonClass} type="submit" disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
