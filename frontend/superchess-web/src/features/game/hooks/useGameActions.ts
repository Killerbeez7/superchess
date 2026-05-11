"use client";

import { useCallback, useState } from "react";
import { joinGame, makeMove } from "@/lib/api/games";
import { ApiError } from "@/lib/api/client";
import {
  applyOptimisticMoveToFen,
  getPieceAtSquare,
  pieceBelongsToColor,
} from "@/utils/board/interactions";
import type { GameResponse, PieceColor } from "@/types/game";
import type { LocalGameSession } from "@/lib/storage/gameSession";
import type { BoardPosition } from "@/utils/board/position";

type UseGameActionsArgs = {
  gameId: string | undefined;
  game: GameResponse | null;
  session: LocalGameSession | null;
  saveSession: (s: LocalGameSession) => void;
  setGame: (g: GameResponse) => void;
  setError: (msg: string | null) => void;
  selectedSquare: string | null;
  setSelectedSquare: (sq: string | null) => void;
  setOptimisticFen: (fen: string | null) => void;
  boardPosition: BoardPosition;
};

export function useGameActions({
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
}: UseGameActionsArgs) {
  const [isJoining, setIsJoining] = useState(false);
  const [isMakingMove, setIsMakingMove] = useState(false);

  const isLocalPlayersTurn = !!session && !!game && session.color === game.whoseTurn;

  const canInteractWithBoard =
    !!game &&
    !!session &&
    game.status === "active" &&
    isLocalPlayersTurn &&
    !isMakingMove;

  const handleJoin = useCallback(
    async (playerName: string) => {
      if (!gameId) {
        setError("Missing game id.");
        return;
      }

      const trimmed = playerName.trim();
      if (!trimmed) {
        setError("Player name is required.");
        return;
      }

      try {
        setError(null);
        setIsJoining(true);
        const result = await joinGame(gameId, trimmed, session?.sessionToken);

        saveSession({
          gameId: result.game.id,
          playerId: result.session.playerId,
          sessionToken: result.session.sessionToken,
          color: result.session.color as PieceColor,
          playerName: trimmed,
        });

        setGame(result.game);
        setOptimisticFen(null);
        setSelectedSquare(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to join game.");
      } finally {
        setIsJoining(false);
      }
    },
    [
      gameId,
      session,
      saveSession,
      setGame,
      setError,
      setOptimisticFen,
      setSelectedSquare,
    ]
  );

  const handleSquareClick = useCallback(
    async (square: string) => {
      if (!gameId || !game || !session || !canInteractWithBoard) return;

      setError(null);
      const clickedPiece = getPieceAtSquare(boardPosition, square);

      if (!selectedSquare) {
        if (!clickedPiece) return;
        if (!pieceBelongsToColor(clickedPiece, session.color)) return;
        setSelectedSquare(square);
        return;
      }

      if (square === selectedSquare) {
        setSelectedSquare(null);
        return;
      }

      if (clickedPiece && pieceBelongsToColor(clickedPiece, session.color)) {
        setSelectedSquare(square);
        return;
      }

      try {
        setIsMakingMove(true);
        const optimisticNextFen = applyOptimisticMoveToFen(
          game.currentFen,
          selectedSquare,
          square
        );

        setOptimisticFen(optimisticNextFen);
        setSelectedSquare(null);

        const updatedGame = await makeMove(gameId, {
          from: selectedSquare,
          to: square,
          playerId: session.playerId,
          sessionToken: session.sessionToken,
        });

        setGame(updatedGame);
        setOptimisticFen(null);
      } catch (err) {
        setOptimisticFen(null);
        setSelectedSquare(null);

        if (!(err instanceof ApiError && err.kind === "validation")) {
          setError(err instanceof Error ? err.message : "Failed to make move.");
        }
      } finally {
        setIsMakingMove(false);
      }
    },
    [
      gameId,
      game,
      session,
      canInteractWithBoard,
      boardPosition,
      selectedSquare,
      setGame,
      setError,
      setOptimisticFen,
      setSelectedSquare,
    ]
  );

  return {
    handleJoin,
    handleSquareClick,
    isJoining,
    isMakingMove,
    canInteractWithBoard,
  };
}
