"use client";

import Link from "next/link";

import { GameHistoryTable } from "@/features/game/components/history/GameHistoryTable";
import { useGameHistory } from "@/features/game/hooks/useGameHistory";

export function RecentGamesPanel() {
  const { games, isAuthenticated, isLoading, error } = useGameHistory();

  return (
    <section className="rounded-2xl border border-border-light bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          Recent games
        </h2>

        <Link
          href="/games"
          className="rounded-md border border-border-light px-2.5 py-1.5 text-xs font-semibold text-text-muted transition hover:bg-bg-light hover:text-text-primary"
        >
          History
        </Link>
      </div>

      <div className="mt-4">
        <GameHistoryTable
          games={games}
          isLoading={isLoading}
          error={error}
          maxRows={5}
          emptyTitle={isAuthenticated ? "No games yet" : "Sign in to see games"}
          emptyDescription={
            isAuthenticated
              ? "Your match history will appear here."
              : "Your recent games will appear after login."
          }
        />
      </div>
    </section>
  );
}
