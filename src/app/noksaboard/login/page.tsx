import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function BoardLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="board-auth">
      <div className="board-auth-card">
        <span className="board-auth-mark">N</span>
        <h1>Noksa dashboard</h1>
        <p className="board-auth-hint">Sign in to manage products and orders.</p>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
