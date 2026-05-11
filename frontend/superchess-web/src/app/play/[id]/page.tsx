"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { LoadingSpinner } from "@/components/layout/LoadingSpinner";
import { ChessBoard } from "@/features/game/components/ChessBoard";
import { GamePlayerBar } from "@/features/game/components/GamePlayerBar";
import { GameUtilityRail } from "@/features/game/components/GameUtilityRail";
import { PlayerIdentitySetup } from "@/features/game/components/PlayerIdentitySetup";
import { useGame } from "@/features/game/hooks/useGame";
import { useGameSession } from "@/features/game/hooks/useGameSession";
import { useGameRealtime } from "@/features/game/hooks/useGameRealtime";
import { useBoardSelection } from "@/features/game/hooks/useBoardSelection";
import { useGameActions } from "@/features/game/hooks/useGameActions";
import { usePlayerIdentity } from "@/features/game/hooks/usePlayerIdentity";
import type { GameResponse } from "@/types/game";

export default function GameDetailsPage() {
  const params = useParams();
  const gameId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [optimisticFen, setOptimisticFen] = useState<string | null>(null);

  const { game, setGame, isLoading, error, setError, refresh } = useGame(gameId);
  const { session, saveSession } = useGameSession(gameId);
  const {
    identity,
    isReady: isIdentityReady,
    setDisplayName,
  } = usePlayerIdentity();
  const displayedFen = optimisticFen ?? game?.currentFen;
  const {
    selectedSquare,
    setSelectedSquare,
    boardPosition,
    candidateSquares,
    lastMoveFrom,
    lastMoveTo,
  } = useBoardSelection(game, session, displayedFen);

  const handlePlayerJoined = useCallback(
    (updated: GameResponse) => {
      setGame(updated);
      setOptimisticFen(null);
    },
    [setGame]
  );

  const handleMovePlayed = useCallback(
    (updated: GameResponse) => {
      setGame(updated);
      setOptimisticFen(null);
      setSelectedSquare(null);
    },
    [setGame, setSelectedSquare]
  );

  const { isConnected } = useGameRealtime({
    gameId,
    onPlayerJoined: handlePlayerJoined,
    onMovePlayed: handleMovePlayed,
  });

  const {
    handleJoin,
    handleSquareClick,
    handleMoveAttempt,
    isJoining,
    canInteractWithBoard,
  } =
    useGameActions({
      gameId,
      game,
      session,
      saveSession,
      setGame,
      setError,
      selectedSquare,
      setSelectedSquare,
      setOptimisticFen,
      boardPosition,
    });

  const handleSaveIdentity = useCallback(
    (displayName: string) => {
      try {
        setError(null);
        setDisplayName(displayName);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save player name.");
      }
    },
    [setDisplayName, setError]
  );

  const handleJoinWithIdentity = useCallback(async () => {
    if (!identity) {
      setError("Player name is required.");
      return;
    }

    await handleJoin(identity.displayName);
  }, [handleJoin, identity, setError]);

  const handleRefresh = useCallback(async () => {
    await refresh();
    setOptimisticFen(null);
    setSelectedSquare(null);
  }, [refresh, setSelectedSquare]);

  const handleSelectionClear = useCallback(() => {
    setSelectedSquare(null);
  }, [setSelectedSquare]);

  const handleVisualSelect = useCallback(
    (square: string) => {
      setSelectedSquare(square);
    },
    [setSelectedSquare]
  );

  const canJoinAsBlack = !!game && !game.blackPlayer && game.status === "waiting";
  const canTakeBlackSeat = canJoinAsBlack && !session;
  const isWhiteTurn = game?.status === "active" && game.whoseTurn === "white";
  const isBlackTurn = game?.status === "active" && game.whoseTurn === "black";

  const blackPlayerName = game?.blackPlayer?.displayName ?? "Waiting for player 2";
  const whitePlayerName = game?.whitePlayer.displayName ?? "Waiting for player 1";

  return (
    <main className="min-h-dvh bg-slate-950/97 text-white">
      <Navbar />
      <section className="min-h-[calc(100dvh-4.5rem)]">
        <div className="mx-auto grid min-h-[calc(100dvh-6rem)] w-full max-w-6xl gap-4 px-2 py-2 sm:px-6 lg:grid-cols-[minmax(0,820px)_210px] lg:items-start lg:gap-5 lg:px-8 lg:py-4">
          <div className="mx-auto w-full max-w-[min(98vw,82dvh,820px)] space-y-1.5 sm:space-y-2 lg:mx-0 lg:max-w-[min(92vw,78dvh,820px)]">
            {isLoading ? (
              <section className="flex min-h-[520px] items-center justify-center rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
                <LoadingSpinner />
              </section>
            ) : game ? (
              <>
                <GamePlayerBar
                  name={blackPlayerName}
                  color="black"
                  timer={game.blackPlayer ? "10:00" : "--:--"}
                  isActive={isBlackTurn}
                  action={
                    canTakeBlackSeat && identity ? (
                      <button
                        type="button"
                        onClick={handleJoinWithIdentity}
                        disabled={isJoining}
                        className="rounded-md bg-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isJoining ? "Joining..." : "Join"}
                      </button>
                    ) : null
                  }
                />

                {canTakeBlackSeat && !isIdentityReady && (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/70 p-6">
                    <LoadingSpinner />
                  </div>
                )}

                {canTakeBlackSeat && isIdentityReady && !identity && (
                  <PlayerIdentitySetup onSave={handleSaveIdentity} />
                )}

                <ChessBoard
                  variant="app"
                  position={boardPosition}
                  interactive={canInteractWithBoard}
                  selectedSquare={selectedSquare}
                  candidateSquares={candidateSquares}
                  lastMoveFrom={lastMoveFrom}
                  lastMoveTo={lastMoveTo}
                  onSquareClick={handleSquareClick}
                  onMoveAttempt={handleMoveAttempt}
                  onSelectionClear={handleSelectionClear}
                  onVisualSelect={handleVisualSelect}
                  draggableColor={session?.color ?? null}
                  allowPieceDrag={!!game}
                />

                <GamePlayerBar
                  name={whitePlayerName}
                  color="white"
                  timer={game.whitePlayer ? "10:00" : "--:--"}
                  isActive={isWhiteTurn}
                />
              </>
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

          <GameUtilityRail
            roomCode={game?.id ?? gameId ?? ""}
            isConnected={isConnected}
            onRefresh={handleRefresh}
          />
        </div>
      </section>
    </main>
  );
}
