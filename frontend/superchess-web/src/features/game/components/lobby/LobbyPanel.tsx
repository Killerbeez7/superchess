"use client";

import type { SubmitEvent } from "react";

import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import type { GameResponse } from "@/types/game";

import { JoinByCodeDisclosure } from "./JoinByCodeDisclosure";
import { OpenRoomsList } from "./OpenRoomsList";

type LobbyPanelProps = {
  isIdentityReady: boolean;
  joinGameId: string;
  waitingGames: GameResponse[];
  isLoadingGames: boolean;
  isCreatingGame: boolean;
  isJoiningGame: boolean;
  isRealtimeConnected: boolean;
  error: string | null;
  onCreateGame: () => void | Promise<void>;
  onJoinGame: (event: SubmitEvent<HTMLFormElement>) => void | Promise<void>;
  onJoinGameIdChange: (value: string) => void;
  onJoinExistingGame: (gameId: string) => void;
  onOpenRoom: (gameId: string) => void;
  onRefreshGames: () => void | Promise<void>;
};

export function LobbyPanel({
  isIdentityReady,
  joinGameId,
  waitingGames,
  isLoadingGames,
  isCreatingGame,
  isJoiningGame,
  isRealtimeConnected,
  error,
  onCreateGame,
  onJoinGame,
  onJoinGameIdChange,
  onJoinExistingGame,
  onOpenRoom,
  onRefreshGames,
}: LobbyPanelProps) {
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#262421] shadow-2xl lg:h-full">
      <header className="shrink-0 border-b border-white/8 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b8b8b8]">
              SuperChess
            </p>
            <h1 className="mt-1 truncate text-xl font-bold text-white">
              Play SuperChess
            </h1>
          </div>
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
              isRealtimeConnected
                ? "border-[#81b64c]/25 bg-[#81b64c]/10 text-[#81b64c]"
                : "border-amber-500/20 bg-amber-500/10 text-amber-300"
            }`}
          >
            {isRealtimeConnected ? "Live" : "Offline"}
          </span>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-4">
        {!isIdentityReady ? (
          <div className="rounded-xl border border-dashed border-white/8 bg-[#1f1e1b] p-5">
            <LoadingSpinner />
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void onCreateGame()}
          disabled={!isIdentityReady || isCreatingGame}
          className="h-9 w-full rounded-md bg-[#81b64c] px-4 text-xs font-bold text-[#1f1e1b] shadow-sm transition hover:bg-[#95c85a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCreatingGame ? "Creating..." : "New Game"}
        </button>

        <JoinByCodeDisclosure
          value={joinGameId}
          isJoining={isJoiningGame}
          onChange={onJoinGameIdChange}
          onSubmit={onJoinGame}
        />

        <OpenRoomsList
          games={waitingGames}
          isLoading={isLoadingGames}
          isJoining={isJoiningGame}
          onRefresh={onRefreshGames}
          onJoin={onJoinExistingGame}
          onOpen={onOpenRoom}
        />

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}
      </div>
    </aside>
  );
}
