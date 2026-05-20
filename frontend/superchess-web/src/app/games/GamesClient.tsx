"use client";

import { Container } from "@/components/layout/Container";
import { PageShell } from "@/components/layout/PageShell";
import { GameHistoryTable } from "@/features/game/components/history/GameHistoryTable";
import { useGameHistory } from "@/features/game/hooks/useGameHistory";

export function GamesClient() {
  const { games, isAuthenticated, isLoading, error, refresh } = useGameHistory();

  return (
    <PageShell>
      <Container className="py-8 lg:py-12">
        <section className="rounded-2xl border border-border-light bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-text-primary">Game history</h1>
              <p className="mt-1 text-sm text-text-muted">
                Review your recent SuperChess games.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void refresh()}
              disabled={!isAuthenticated || isLoading}
              className="h-9 rounded-lg border border-border-light px-3 text-sm font-bold text-text-muted transition hover:bg-bg-light hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Refresh
            </button>
          </div>

          <div className="mt-5">
            <GameHistoryTable
              games={games}
              isLoading={isLoading}
              error={error}
              emptyTitle={isAuthenticated ? "No games yet" : "Sign in to see history"}
              emptyDescription={
                isAuthenticated
                  ? "Start a game to build your match history."
                  : "Use the profile button to login or create an account."
              }
            />
          </div>
        </section>
      </Container>
    </PageShell>
  );
}
