"use client";
import { useActionState, useState } from "react";
import { login } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, undefined);
  // Controlled so a failed attempt doesn't wipe it (React resets
  // uncontrolled fields after every form action).
  const [email, setEmail] = useState("");
  return (
    <form action={formAction} className="board-auth-form">
      <input type="hidden" name="next" value={next ?? "/noksaboard"} />
      <label>
        Email
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Password
        <input type="password" name="password" required autoComplete="current-password" />
      </label>
      {state?.error && (
        <p className="board-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="board-button board-button-primary board-button-block" type="submit" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
