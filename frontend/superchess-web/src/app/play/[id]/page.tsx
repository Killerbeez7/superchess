"use client";

import { useCallback, useRef, useState } from "react";
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
import {
  getCandidateSquares,
  getPieceAtSquare,
  pieceBelongsToColor,
} from "@/utils/board/interactions";
import type { GameResponse } from "@/types/game";
import type { BoardPiece } from "@/utils/board/position";

export default function GameDetailsPage() {
  const params = useParams();
  const gameId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [optimisticFen, setOptimisticFen] = useState<string | null>(null);
  const pendingTapMoveFromRef = useRef<string | null>(null);

  const { game, setGame, isLoading, error, setError, refresh } = useGame(gameId);
  const { session, saveSession } = useGameSession(gameId);
  const { identity, isReady: isIdentityReady, setDisplayName } = usePlayerIdentity();
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
    handleMoveAttempt,
    isJoining,
    canInteractWithBoard,
  } = useGameActions({
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

  const isOwnPlayablePiece = useCallback(
    (piece: BoardPiece | null) =>
      !!piece &&
      canInteractWithBoard &&
      !!session &&
      pieceBelongsToColor(piece, session.color),
    [canInteractWithBoard, session]
  );

  const handleBoardPiecePress = useCallback(
    (square: string, piece: BoardPiece) => {
      const selectedPiece = selectedSquare
        ? getPieceAtSquare(boardPosition, selectedSquare)
        : null;
      const selectedOwnPlayable = isOwnPlayablePiece(selectedPiece);
      const pressedOwnPlayable = isOwnPlayablePiece(piece);
      let pendingTapMoveFrom: string | null = null;

      if (selectedOwnPlayable && selectedSquare !== square && !pressedOwnPlayable) {
        const candidates =
          selectedPiece && selectedSquare
            ? getCandidateSquares(boardPosition, selectedSquare, selectedPiece)
            : [];

        if (candidates.includes(square)) {
          pendingTapMoveFrom = selectedSquare;
        }
      }

      if (selectedSquare === square) {
        pendingTapMoveFromRef.current = null;
        return false;
      }

      pendingTapMoveFromRef.current = pendingTapMoveFrom;
      setSelectedSquare(square);
      return pendingTapMoveFrom === null;
    },
    [boardPosition, isOwnPlayablePiece, selectedSquare, setSelectedSquare]
  );

  const handleBoardTap = useCallback(
    async (square: string) => {
      const pendingTapMoveFrom = pendingTapMoveFromRef.current;
      pendingTapMoveFromRef.current = null;

      if (pendingTapMoveFrom) {
        const pendingPiece = getPieceAtSquare(boardPosition, pendingTapMoveFrom);

        if (pendingPiece && isOwnPlayablePiece(pendingPiece)) {
          const candidates = getCandidateSquares(
            boardPosition,
            pendingTapMoveFrom,
            pendingPiece
          );

          if (candidates.includes(square)) {
            await handleMoveAttempt(pendingTapMoveFrom, square);
            return;
          }
        }
      }

      const clickedPiece = getPieceAtSquare(boardPosition, square);
      const selectedPiece = selectedSquare
        ? getPieceAtSquare(boardPosition, selectedSquare)
        : null;
      const selectedOwnPlayable = isOwnPlayablePiece(selectedPiece);

      if (selectedOwnPlayable && selectedSquare && selectedPiece) {
        if (square === selectedSquare) {
          setSelectedSquare(null);
          return;
        }

        if (clickedPiece && isOwnPlayablePiece(clickedPiece)) {
          setSelectedSquare(square);
          return;
        }

        const candidates = getCandidateSquares(
          boardPosition,
          selectedSquare,
          selectedPiece
        );

        if (candidates.includes(square)) {
          await handleMoveAttempt(selectedSquare, square);
          return;
        }

        setSelectedSquare(null);
        return;
      }

      if (clickedPiece) {
        setSelectedSquare(selectedSquare === square ? null : square);
        return;
      }

      setSelectedSquare(null);
    },
    [
      boardPosition,
      handleMoveAttempt,
      isOwnPlayablePiece,
      selectedSquare,
      setSelectedSquare,
    ]
  );

  const handleBoardDragEnd = useCallback(
    async (from: string, releasedOn: string | null) => {
      pendingTapMoveFromRef.current = null;
      const sourcePiece = getPieceAtSquare(boardPosition, from);

      if (!sourcePiece) {
        setSelectedSquare(null);
        return;
      }

      if (!isOwnPlayablePiece(sourcePiece)) {
        setSelectedSquare(from);
        return;
      }

      if (!releasedOn || releasedOn === from) {
        setSelectedSquare(from);
        return;
      }

      const candidates = getCandidateSquares(boardPosition, from, sourcePiece);

      if (!candidates.includes(releasedOn)) {
        setSelectedSquare(from);
        return;
      }

      await handleMoveAttempt(from, releasedOn);
    },
    [boardPosition, handleMoveAttempt, isOwnPlayablePiece, setSelectedSquare]
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
        <div className="mx-auto grid min-h-[calc(100dvh-6rem)] w-full max-w-6xl gap-5 px-4 py-3 sm:px-6 lg:grid-cols-[minmax(0,820px)_210px] lg:items-start lg:px-8 lg:py-4">
          <div className="mx-auto w-full max-w-[min(92vw,78dvh,820px)] space-y-2 lg:mx-0">
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
                  onPiecePress={handleBoardPiecePress}
                  onSquareTap={handleBoardTap}
                  onDragEnd={handleBoardDragEnd}
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
