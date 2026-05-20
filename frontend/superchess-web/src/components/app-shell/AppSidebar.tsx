"use client";

import Link from "next/link";
import { AccountButton } from "./AccountButton";
import { AppSidebarItem } from "./AppSidebarItem";
import { AppSidebarPlayItem } from "./AppSidebarPlayItem";
import { SettingsButton } from "./SettingsButton";
import { FaHouse, FaChessBoard, FaCircleInfo } from "react-icons/fa6";

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
          <SettingsButton />
          <AccountButton />
        </div>
      </aside>
    </>
  );
}
