"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { FaUser } from "react-icons/fa6";

import { AuthModal } from "@/features/auth/components/AuthModal";
import { useAuth } from "@/features/auth/hooks/useAuth";

type AccountButtonProps = {
  onOpen?: () => void;
  variant?: "row" | "icon";
};

function AccountDetailsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();

  if (!isOpen || !user) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-90 grid place-items-center bg-black/60 p-4">
      <section className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-app-border bg-panel shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-app-border p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
              SuperChess account
            </p>
            <h2 className="mt-1 text-xl font-black text-text-primary">
              {user.displayName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-app-border px-2.5 py-1.5 text-xs font-bold text-text-muted transition hover:bg-bg-light hover:text-text-primary"
          >
            Close
          </button>
        </header>

        <div className="grid gap-3 p-5">
          <div className="rounded-xl border border-app-border bg-card-muted p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
              Email
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-text-primary">
              {user.email}
            </p>
          </div>

          <div className="rounded-xl border border-app-border bg-card-muted p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
              Account
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Profile editing and match stats will live here later.
            </p>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}

export function AccountButton({ onOpen, variant = "row" }: AccountButtonProps) {
  const { user, isReady, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  function handleClick() {
    if (!isReady) return;

    onOpen?.();

    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsAccountModalOpen(true);
  }

  const label = !isReady
    ? "Loading account"
    : isAuthenticated
      ? "Open account"
      : "Sign in";

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={!isReady}
          aria-label={label}
          title={label}
          className="grid h-10 w-10 place-items-center rounded-xl text-sm text-text-muted transition enabled:hover:bg-bg-light enabled:hover:text-text-primary disabled:cursor-wait disabled:opacity-70"
        >
          <FaUser />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={!isReady}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition enabled:hover:bg-bg-light disabled:cursor-wait disabled:opacity-70"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-sm text-text-muted transition group-enabled:group-hover:bg-bg-light group-enabled:group-hover:text-text-primary">
            <FaUser />
          </span>

          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-text-primary">
              {!isReady ? "Loading..." : user?.displayName ?? "Guest"}
            </span>
            <span className="block truncate text-xs text-text-muted">
              {!isReady ? "Account" : user?.email ?? "Sign in"}
            </span>
          </span>
        </button>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason="Sign in to sync your SuperChess account."
      />

      <AccountDetailsModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </>
  );
}
