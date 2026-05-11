"use client";

import Link from "next/link";

import { ConnectionBadge } from "./ConnectionBadge";

type GameUtilityRailProps = {
  roomCode: string;
  isConnected: boolean;
  onRefresh: () => void;
};

export function GameUtilityRail({
  roomCode,
  isConnected,
  onRefresh,
}: GameUtilityRailProps) {
  function handleCopyRoomCode() {
    if (!roomCode || typeof navigator === "undefined") return;
    void navigator.clipboard?.writeText(roomCode);
  }

  return (
    <aside className="w-full lg:sticky lg:top-24 lg:pt-9">
      <div className="space-y-4 pt-3  lg:border-t-0 lg:pl-4 lg:pt-0">
        <section className="flex items-center justify-between gap-3 lg:block lg:space-y-2">
          <ConnectionBadge isConnected={isConnected} />
        </section>

        <section className="space-y-2 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              Room
            </p>
            <button
              type="button"
              onClick={handleCopyRoomCode}
              className="rounded-md px-2 py-1 text-[11px] font-semibold text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
            >
              Copy
            </button>
          </div>
          <p className="break-all rounded-md border border-white/10 bg-slate-950/30 p-2 font-mono text-[11px] leading-5 text-slate-500">
            {roomCode || "Loading"}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-2 border-t border-white/10 pt-4 lg:grid-cols-1">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-md border border-white/10 px-3 py-2 text-center text-[11px] font-semibold text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
          >
            Refresh
          </button>
          <Link
            href="/play"
            className="rounded-md border border-white/10 px-3 py-2 text-center text-[11px] font-semibold text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
          >
            Rooms
          </Link>
        </section>
      </div>
    </aside>
  );
}
