import Link from "next/link";
import { FaBolt } from "react-icons/fa6";

import type { GameHistoryResponse, PieceColor } from "@/types/game";

type GameHistoryTableProps = {
  games: GameHistoryResponse[];
  isLoading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  maxRows?: number;
};

function getTimeControlLabel(game: GameHistoryResponse) {
  const minutes = Math.round(game.initialClockMs / 60_000);
  const incrementSeconds = Math.round(game.incrementMs / 1000);

  return incrementSeconds > 0 ? `${minutes} | ${incrementSeconds}` : `${minutes} min`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function PlayerLine({
  color,
  name,
  winnerColor,
}: {
  color: PieceColor;
  name: string;
  winnerColor: PieceColor | null;
}) {
  const didWin = winnerColor === color;
  const chipClassName = color === "white" ? "bg-white" : "bg-text-subtle";

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-[2px] ring-1 ${
          didWin ? "ring-accent" : "ring-border-light"
        } ${chipClassName}`}
      />
      <span
        className={`truncate text-xs font-bold sm:text-sm ${
          didWin ? "text-text-primary" : "text-text-muted"
        }`}
      >
        {name}
      </span>
    </div>
  );
}

function ResultStack({ game }: { game: GameHistoryResponse }) {
  const whiteScore = game.winnerColor === "white" ? 1 : game.winnerColor ? 0 : 0.5;
  const blackScore = game.winnerColor === "black" ? 1 : game.winnerColor ? 0 : 0.5;

  return (
    <div className="grid justify-start gap-0.5 font-mono text-sm font-bold tabular-nums">
      <span className={game.winnerColor === "white" ? "text-accent" : "text-text-muted"}>
        {whiteScore}
      </span>
      <span className={game.winnerColor === "black" ? "text-accent" : "text-text-muted"}>
        {blackScore}
      </span>
    </div>
  );
}

function TimeControlCell({ game }: { game: GameHistoryResponse }) {
  return (
    <div className="hidden min-w-0 text-center sm:block">
      <FaBolt className="mx-auto h-5 w-5 text-accent" aria-hidden="true" />
      <p className="mt-0.5 text-xs text-text-muted">{getTimeControlLabel(game)}</p>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 sm:grid-cols-[64px_minmax(0,1.5fr)_72px_104px_70px_112px]"
        >
          <div className="hidden space-y-2 sm:block">
            <div className="mx-auto h-5 w-5 rounded-full bg-bg-light" />
            <div className="mx-auto h-2.5 w-9 rounded-full bg-bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-32 rounded-full bg-bg-light" />
            <div className="h-2.5 w-44 rounded-full bg-bg-muted" />
          </div>
          <div className="h-3 w-12 rounded-full bg-bg-light" />
          <div className="hidden h-3 w-8 rounded-full bg-bg-muted sm:block" />
          <div className="hidden h-3 w-12 rounded-full bg-bg-muted sm:block" />
          <div className="hidden h-3 w-16 rounded-full bg-bg-muted sm:block" />
        </div>
      ))}
    </>
  );
}

export function GameHistoryTable({
  games,
  isLoading = false,
  error,
  emptyTitle = "No games yet",
  emptyDescription = "Your match history will appear here.",
  maxRows,
}: GameHistoryTableProps) {
  const visibleGames = typeof maxRows === "number" ? games.slice(0, maxRows) : games;

  return (
    <div className="overflow-hidden rounded-xl border border-border-light bg-card-muted">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border-light bg-card-header px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted sm:grid-cols-[64px_minmax(0,1.5fr)_72px_104px_70px_112px]">
        <span className="hidden sm:block" />
        <span>Players</span>
        <span>Result</span>
        <span className="hidden sm:block">Accuracy</span>
        <span className="hidden sm:block">Moves</span>
        <span className="hidden sm:block">Date</span>
      </div>

      <div className="divide-y divide-border-light">
        {isLoading ? <LoadingRows /> : null}

        {!isLoading && error ? (
          <div className="px-4 py-4 text-sm text-red-200">{error}</div>
        ) : null}

        {!isLoading && !error && games.length === 0 ? (
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 text-sm sm:grid-cols-[64px_minmax(0,1.5fr)_72px_104px_70px_112px]">
            <span className="hidden sm:block" />
            <div>
              <p className="font-semibold text-text-primary">{emptyTitle}</p>
              <p className="mt-0.5 text-xs text-text-muted">{emptyDescription}</p>
            </div>

            <span className="text-text-subtle">-</span>
            <span className="hidden text-text-subtle sm:block">-</span>
            <span className="hidden text-text-subtle sm:block">-</span>
            <span className="hidden text-text-subtle sm:block">-</span>
          </div>
        ) : null}

        {!isLoading && !error
          ? visibleGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/game/${game.id}`}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 text-sm transition hover:bg-bg-light sm:grid-cols-[64px_minmax(0,1.5fr)_72px_104px_70px_112px]"
                >
                  <TimeControlCell game={game} />

                  <div className="min-w-0">
                    <div className="grid gap-1">
                      <PlayerLine
                        color="white"
                        name={game.whitePlayerName}
                        winnerColor={game.winnerColor}
                      />
                      <PlayerLine
                        color="black"
                        name={game.blackPlayerName}
                        winnerColor={game.winnerColor}
                      />
                    </div>
                    <p className="mt-1 truncate text-xs capitalize text-text-muted sm:hidden">
                      {getTimeControlLabel(game)}
                      {game.opponentIsBot ? " | bot" : ""}
                    </p>
                  </div>

                  <ResultStack game={game} />
                  <span className="hidden sm:block">
                    <span className="inline-flex h-8 items-center rounded-md bg-bg-light px-4 text-xs font-bold text-text-primary shadow-sm">
                      Review
                    </span>
                  </span>
                  <span className="hidden text-text-muted sm:block">{game.moveCount}</span>
                  <span className="hidden text-text-muted sm:block">
                    {formatDate(game.updatedAtUtc)}
                  </span>
                </Link>
              ))
          : null}
      </div>
    </div>
  );
}
