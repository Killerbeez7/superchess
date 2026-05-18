"use client";

import { useState, type FormEvent } from "react";

import type { CurrentUser } from "@/features/auth/api/auth";
import { useAuth } from "@/features/auth/hooks/useAuth";

type RegisterFormProps = {
  onSuccess?: (user: CurrentUser) => void;
};

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { registerUser } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setError(null);
      setIsSubmitting(true);
      const user = await registerUser({ displayName, email, password });
      onSuccess?.(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <label className="grid gap-1.5 text-sm font-semibold text-text-primary">
        Display name
        <input
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          autoComplete="nickname"
          required
          className="h-11 rounded-xl border border-app-border bg-sidebar px-3 text-sm outline-none transition placeholder:text-text-muted focus:border-primary-green"
          placeholder="Player name"
        />
      </label>

      <label className="grid gap-1.5 text-sm font-semibold text-text-primary">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          className="h-11 rounded-xl border border-app-border bg-sidebar px-3 text-sm outline-none transition placeholder:text-text-muted focus:border-primary-green"
          placeholder="you@example.com"
        />
      </label>

      <label className="grid gap-1.5 text-sm font-semibold text-text-primary">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
          className="h-11 rounded-xl border border-app-border bg-sidebar px-3 text-sm outline-none transition placeholder:text-text-muted focus:border-primary-green"
          placeholder="At least 6 characters"
        />
      </label>

      {error ? (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 h-11 rounded-xl bg-primary-green px-4 text-sm font-black text-panel transition hover:bg-primary-green-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}
