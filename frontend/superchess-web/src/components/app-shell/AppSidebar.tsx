"use client";

import Link from "next/link";
import { AppSidebarItem } from "./AppSidebarItem";
import {
  FaHouse,
  FaChessKnight,
  FaChessBoard,
  FaCircleInfo,
  FaGear,
  FaUser,
} from "react-icons/fa6";

function LogoMark() {
  return (
    <Link
      href="/"
      aria-label="SuperChess home"
      className="flex h-12 items-center gap-3 rounded-xl bg-panel px-3 text-text-primary ring-1 ring-app-border transition hover:bg-white/6"
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
  return (
    <aside className="hidden h-dvh w-[220px] shrink-0 border-r border-app-border bg-sidebar px-4 py-4 lg:flex lg:flex-col">
      <LogoMark />

      <nav className="mt-8 flex flex-1 flex-col gap-2">
        <AppSidebarItem href="/" label="Home" exact icon={<FaHouse />} />
        <AppSidebarItem href="/play" label="Play" icon={<FaChessKnight />} />
        <AppSidebarItem href="/games" label="Games" icon={<FaChessBoard />} />
        <AppSidebarItem href="/about" label="About" icon={<FaCircleInfo />} />
      </nav>

      <div className="space-y-2 border-t border-app-border pt-4">
        <button
          type="button"
          className="group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-text-muted transition hover:bg-white/7 hover:text-text-primary"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white/6 text-sm transition group-hover:bg-[#3a352d]">
            <FaGear />
          </span>
          <span className="truncate">Settings</span>
        </button>

        <button
          type="button"
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-white/[0.07]"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/6 text-sm text-text-muted transition group-hover:bg-[#3a352d] group-hover:text-text-primary">
            <FaUser />
          </span>

          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-text-primary">
              Player
            </span>
            <span className="block truncate text-xs text-text-muted">Local profile</span>
          </span>
        </button>
      </div>
    </aside>
  );
}
