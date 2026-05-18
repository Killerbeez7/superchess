"use client";

import { useState } from "react";

import type { CurrentUser } from "@/features/auth/api/auth";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

type AuthMode = "login" | "register";

export type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated?: (user: CurrentUser) => void;
  reason?: string;
};

export function AuthModal({
  isOpen,
  onClose,
  onAuthenticated,
  reason,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");

  if (!isOpen) return null;

  const handleAuthenticated = (user: CurrentUser) => {
    onAuthenticated?.(user);
    if (!onAuthenticated) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-90 grid place-items-center bg-black/60 p-4">
      <section className="w-full max-w-md rounded-2xl border border-app-border bg-panel shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-app-border p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
              SuperChess account
            </p>
            <h2 className="mt-1 text-xl font-black text-text-primary">
              {mode === "login" ? "Sign in" : "Create account"}
            </h2>
            {reason ? <p className="mt-2 text-sm text-text-muted">{reason}</p> : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-app-border px-2.5 py-1.5 text-xs font-bold text-text-muted transition hover:bg-bg-light hover:text-text-primary"
          >
            Close
          </button>
        </header>

        <div className="p-5">
          <div className="grid grid-cols-2 rounded-xl border border-app-border bg-card-muted p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`h-9 rounded-lg text-sm font-bold transition ${
                mode === "login"
                  ? "bg-primary-green text-panel"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`h-9 rounded-lg text-sm font-bold transition ${
                mode === "register"
                  ? "bg-primary-green text-panel"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Create account
            </button>
          </div>

          <div className="mt-5">
            {mode === "login" ? (
              <LoginForm onSuccess={handleAuthenticated} />
            ) : (
              <RegisterForm onSuccess={handleAuthenticated} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
