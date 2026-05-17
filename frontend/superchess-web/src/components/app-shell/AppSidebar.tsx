"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { AppSidebarItem } from "./AppSidebarItem";
import { AppSidebarPlayItem } from "./AppSidebarPlayItem";
import { usePlayerIdentity } from "@/features/game/hooks/usePlayerIdentity";
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
  const { identity, isReady, setDisplayName } = usePlayerIdentity();
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);

  const canEditPlayer = isReady && !!identity;

  function openPlayerModal() {
    if (!identity) return;

    setDraftName(identity.displayName);
    setProfileError(null);
    setIsPlayerModalOpen(true);
  }

  function handleSavePlayer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setDisplayName(draftName);
      setProfileError(null);
      setIsPlayerModalOpen(false);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to save player.");
    }
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
            onClick={openPlayerModal}
            disabled={!canEditPlayer}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition enabled:hover:bg-bg-light disabled:cursor-default"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-sm text-text-muted transition group-enabled:group-hover:bg-bg-light group-enabled:group-hover:text-text-primary">
              <FaUser />
            </span>

            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-text-primary">
                {identity?.displayName ?? "Player"}
              </span>
              <span className="block truncate text-xs text-text-muted">
                {isReady && identity ? "Edit profile" : "No local profile"}
              </span>
            </span>
          </button>
        </div>
      </aside>

      {isPlayerModalOpen && identity && (
        <div className="fixed inset-0 z-80 grid place-items-center bg-black/55 p-4">
          <section className="w-full max-w-sm rounded-2xl border border-app-border bg-panel p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Player
                </p>
                <h2 className="mt-1 text-lg font-bold text-text-primary">Edit name</h2>
              </div>

              <button
                type="button"
                onClick={() => setIsPlayerModalOpen(false)}
                className="rounded-md border border-app-border px-2 py-1 text-xs font-semibold text-text-muted transition hover:bg-bg-light hover:text-text-primary"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="mt-4 space-y-3">
              <input
                type="text"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="Player name"
                autoFocus
                className="h-10 w-full rounded-lg border border-app-border bg-sidebar px-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary-green"
              />

              {profileError && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {profileError}
                </p>
              )}

              <button
                type="submit"
                className="h-9 w-full rounded-md bg-primary-green px-4 text-xs font-bold text-panel shadow-sm transition hover:bg-primary-green-hover"
              >
                Save name
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
