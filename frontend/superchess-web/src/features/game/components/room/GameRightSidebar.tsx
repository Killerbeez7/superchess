"use client";

import Link from "next/link";
import { useState } from "react";

import { MoveHistory } from "@/features/game/components/history/MoveHistory";
import type { GameResponse } from "@/types/game";

import { GameSidebarFooter } from "./GameSidebarFooter";
import { GameSidebarTabs, type GameSidebarTab } from "./GameSidebarTabs";

type GameRightSidebarProps = {
  game: GameResponse | null;
  gameId: string;
  isConnected: boolean;
  onRefresh: () => void | Promise<void>;
};

function StatusPill({ isConnected }: { isConnected: boolean }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
        isConnected
          ? "border-[#81b64c]/25 bg-[#81b64c]/10 text-[#81b64c]"
          : "border-amber-500/20 bg-amber-500/10 text-amber-300"
      }`}
    >
      {isConnected ? "Connected" : "Reconnecting"}
    </span>
  );
}

function RoomInfo({
  game,
  roomCode,
  isConnected,
  copied,
  onCopyInviteLink,
}: {
  game: GameResponse | null;
  roomCode: string;
  isConnected: boolean;
  copied: boolean;
  onCopyInviteLink: () => void;
}) {
  return (
    <div className="grid gap-3">
      <section className="rounded-xl border border-white/8 bg-[#211f1c] p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b8b8b8]">
            Connection
          </p>
          <StatusPill isConnected={isConnected} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-[#24231f] p-2">
            <p className="font-semibold uppercase tracking-[0.12em] text-[#b8b8b8]">
              Status
            </p>
            <p className="mt-1 font-bold capitalize text-white">
              {game?.status ?? "Loading"}
            </p>
          </div>
          <div className="rounded-lg bg-[#24231f] p-2">
            <p className="font-semibold uppercase tracking-[0.12em] text-[#b8b8b8]">
              Turn
            </p>
            <p className="mt-1 font-bold capitalize text-white">
              {game?.whoseTurn ?? "-"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-white/8 bg-[#211f1c] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b8b8b8]">
          Invite
        </p>
        <p className="mt-3 break-all rounded-lg border border-white/8 bg-[#24231f] p-2.5 font-mono text-[11px] leading-5 text-[#b8b8b8]">
          {roomCode || "Loading room"}
        </p>
        <button
          type="button"
          onClick={onCopyInviteLink}
          className="mt-2 w-full rounded-lg border border-white/8 bg-[#24231f] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/6"
        >
          {copied ? "Copied invite" : "Copy invite link"}
        </button>
      </section>
    </div>
  );
}

export function GameRightSidebar({
  game,
  gameId,
  isConnected,
  onRefresh,
}: GameRightSidebarProps) {
  const [activeTab, setActiveTab] = useState<GameSidebarTab>("moves");
  const [copied, setCopied] = useState(false);
  const roomCode = game?.id ?? gameId;
  const lobbyLabel = game?.status === "completed" ? "New game" : "Back to lobby";

  function handleCopyInviteLink() {
    if (!roomCode || typeof window === "undefined") return;

    const inviteUrl = `${window.location.origin}/game/${roomCode}`;
    void navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#262421] shadow-2xl">
      <header className="shrink-0 border-b border-white/8 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b8b8b8]">
              SuperChess
            </p>
          </div>
          <StatusPill isConnected={isConnected} />
        </div>
        <div>
          {" "}
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b8b8b8]">
            invite code
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyInviteLink}
          className="mt-3 w-full break-all rounded-lg border border-white/8 bg-[#211f1c] p-2.5 text-left font-mono text-[11px] leading-5 text-[#b8b8b8] transition hover:bg-white/4"
        >
          {copied ? "Invite copied" : roomCode || "Loading room"}
        </button>
      </header>

      <section className="shrink-0 border-b border-white/8 p-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-lg border border-white/8 bg-[#211f1c] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/6"
          >
            Refresh
          </button>
          <Link
            href="/play"
            className="rounded-lg bg-[#81b64c] px-3 py-2 text-center text-sm font-bold text-[#211f1c] transition hover:bg-[#95c85a]"
          >
            {lobbyLabel}
          </Link>
        </div>
      </section>

      <GameSidebarTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="min-h-0 flex-1 overflow-hidden bg-[#24231f]">
        {activeTab === "moves" && (
          <section className="flex h-full min-h-0 flex-col">
            <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b8b8b8]">
                Moves
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <MoveHistory moves={game?.moves ?? []} />
            </div>
          </section>
        )}

        {activeTab === "info" && (
          <div className="h-full overflow-y-auto p-3">
            <RoomInfo
              game={game}
              roomCode={roomCode}
              isConnected={isConnected}
              copied={copied}
              onCopyInviteLink={handleCopyInviteLink}
            />
          </div>
        )}
      </div>

      <GameSidebarFooter isActiveGame={game?.status === "active"} />
    </aside>
  );
}
