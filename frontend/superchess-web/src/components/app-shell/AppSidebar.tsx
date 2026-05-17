"use client";

import Link from "next/link";
import { useState } from "react";
import { AppSidebarItem } from "./AppSidebarItem";
import { AppSidebarPlayItem } from "./AppSidebarPlayItem";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { FaHouse, FaChessBoard, FaCircleInfo, FaGear, FaUser } from "react-icons/fa6";

function LogoMark() {
  return (
    <Link
      href="/"
      aria-label="SuperChess home"
      className="flex h-12 items-center gap-3 rounded-xl bg-panel px-3 text-text-primary ring-1 ring-app-border transition hover:bg-bg-light"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-green text-lg font-black text-panel">
        S
      </span>

      <span className="leading-tight">
        <span className="block text-sm font-black tracking-tight">SuperChess</span>
        <span className="block text-[11px] font-semibold text-text-muted">
          Online chess
        </span>
      </span>
    </Link>
  );
}

export function AppSidebar() {
  const { user, isReady, isAuthenticated, logoutUser } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  function handleAccountClick() {
    if (!isReady) return;

    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsAccountMenuOpen((open) => !open);
  }

  return (
    <>
      <aside className="fixed left-0 top-0 z-50 hidden h-dvh w-[220px] shrink-0 border-r border-app-border bg-sidebar px-4 py-4 lg:flex lg:flex-col">
        <LogoMark />

        <nav className="mt-8 flex flex-1 flex-col gap-2">
          <AppSidebarItem href="/" label="Home" exact icon={<FaHouse />} />
          <AppSidebarPlayItem />
          <AppSidebarItem href="/games" label="Games" icon={<FaChessBoard />} />
          <AppSidebarItem href="/about" label="About" icon={<FaCircleInfo />} />
        </nav>

        <div className="space-y-2 border-t border-app-border pt-4">
          <button
            type="button"
            className="group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-text-muted transition hover:bg-bg-light hover:text-text-primary"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-sm text-text-muted transition group-hover:bg-bg-light group-hover:text-text-primary">
              {" "}
              <FaGear />
            </span>
            <span className="truncate">Settings</span>
          </button>

          <button
            type="button"
            onClick={handleAccountClick}
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

          {isAccountMenuOpen && isAuthenticated && (
            <div className="rounded-xl border border-app-border bg-panel p-2 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  setIsAccountMenuOpen(false);
                }}
                className="h-9 w-full rounded-lg px-3 text-left text-sm font-semibold text-text-muted transition hover:bg-bg-light hover:text-text-primary"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason="Sign in to sync your SuperChess account."
      />
    </>
  );
}
