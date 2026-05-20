"use client";

import { useState } from "react";
import { FaGear } from "react-icons/fa6";

import { useAuth } from "@/features/auth/hooks/useAuth";

type SettingsButtonProps = {
  onOpen?: () => void;
  variant?: "row" | "icon";
};

export function SettingsButton({ onOpen, variant = "row" }: SettingsButtonProps) {
  const { isReady, isAuthenticated, logoutUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  function toggleSettings() {
    if (!isReady) return;

    onOpen?.();
    setIsOpen((open) => !open);
  }

  async function handleLogout() {
    await logoutUser();
    setIsOpen(false);
  }

  return (
    <div className="relative">
      {variant === "icon" ? (
        <button
          type="button"
          onClick={toggleSettings}
          disabled={!isReady}
          aria-expanded={isOpen}
          aria-label="Open settings"
          title="Settings"
          className="grid h-10 w-10 place-items-center rounded-xl text-sm text-text-muted transition enabled:hover:bg-bg-light enabled:hover:text-text-primary disabled:cursor-wait disabled:opacity-45"
        >
          <FaGear />
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleSettings}
          disabled={!isReady}
          aria-expanded={isOpen}
          className="group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-text-muted transition enabled:hover:bg-bg-light enabled:hover:text-text-primary disabled:cursor-wait disabled:opacity-60"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-sm text-text-muted transition group-enabled:group-hover:bg-bg-light group-enabled:group-hover:text-text-primary">
            <FaGear />
          </span>
          <span className="truncate">Settings</span>
        </button>
      )}

      {isOpen ? (
        <div
          className={
            variant === "icon"
              ? "absolute right-0 top-full z-60 mt-2 w-48 rounded-xl border border-app-border bg-panel p-2 shadow-2xl"
              : "mt-1 rounded-xl border border-app-border bg-panel p-2 shadow-xl"
          }
        >
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="h-9 w-full rounded-lg px-3 text-left text-sm font-semibold text-text-muted transition hover:bg-bg-light hover:text-text-primary"
            >
              Logout
            </button>
          ) : (
            <p className="px-3 py-2 text-xs text-text-muted">
              Sign in to manage account settings.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
