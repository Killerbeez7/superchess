"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { LoadingSpinner } from "@/components/layout/LoadingSpinner";
import { ChessBoard } from "@/features/game/components/ChessBoard";
import { GameSidebar } from "@/features/game/components/GameSidebar";
import { useGame } from "@/features/game/hooks/useGame";
import { useGameSession } from "@/features/game/hooks/useGameSession";
import { useGameRealtime } from "@/features/game/hooks/useGameRealtime";
import { useBoardSelection } from "@/features/game/hooks/useBoardSelection";
import { useGameActions } from "@/features/game/hooks/useGameActions";
import type { GameResponse } from "@/types/game";

export default function GameDetailsPage() {
  const params = useParams();
  const gameId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { game, setGame, isLoading, error, setError, refresh } = useGame(gameId);
  const { session, saveSession } = useGameSession(gameId);
  const {
    selectedSquare,
    setSelectedSquare,
    boardPosition,
    candidateSquares,
    lastMoveFrom,
    lastMoveTo,
  } = useBoardSelection(game, session);

  const handleMovePlayed = useCallback(
    (updated: GameResponse) => {
      setGame(updated);
      setSelectedSquare(null);
    },
    [setGame, setSelectedSquare]
  );

  const { isConnected } = useGameRealtime({
    gameId,
    onPlayerJoined: setGame,
    onMovePlayed: handleMovePlayed,
  });

  const { handleJoin, handleSquareClick, isJoining, canInteractWithBoard } =
    useGameActions({
      gameId,
      game,
      session,
      saveSession,
      setGame,
      setError,
      selectedSquare,
      setSelectedSquare,
      boardPosition,
    });

  return (
    <main className="min-h-dvh bg-slate-950/97 text-white">
      <Navbar />
      <section className="min-h-[calc(100dvh-4.5rem)]">
        <div className="mx-auto grid min-h-[calc(100dvh-6rem)] max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8 lg:py-6">
          <div className="space-y-5">
            {isLoading ? (
              <section className="flex min-h-[520px] items-center justify-center rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
                <LoadingSpinner />
              </section>
            ) : game ? (
              <ChessBoard
                variant="app"
                position={boardPosition}
                interactive={canInteractWithBoard}
                selectedSquare={selectedSquare}
                candidateSquares={candidateSquares}
                lastMoveFrom={lastMoveFrom}
                lastMoveTo={lastMoveTo}
                onSquareClick={handleSquareClick}
              />
            ) : (
              <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-sm text-red-200">
                Game not found.
              </section>
            )}

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>

          <GameSidebar
            game={game}
            session={session}
            isLoading={isLoading}
            isConnected={isConnected}
            isJoining={isJoining}
            onJoin={handleJoin}
            onRefresh={refresh}
          />
        </div>
      </section>
    </main>
  );
}
