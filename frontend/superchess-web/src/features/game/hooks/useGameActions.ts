"use client";

import { useCallback, useState } from "react";
import { joinGame, makeMove } from "@/lib/api/games";
import { ApiError } from "@/lib/api/client";
import { getPieceAtSquare, pieceBelongsToColor } from "@/utils/board/interactions";
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
        setSelectedSquare(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to join game.");
      } finally {
        setIsJoining(false);
      }
    },
    [gameId, session, saveSession, setGame, setError, setSelectedSquare]
  );

  const handleSquareClick = useCallback(
    async (square: string) => {
      if (!gameId || !game || !session || !canInteractWithBoard) return;

      setError(null);
      const clickedPiece = getPieceAtSquare(boardPosition, square);

      // No selection yet
      if (!selectedSquare) {
        if (!clickedPiece) return;
        if (!pieceBelongsToColor(clickedPiece, session.color)) return;
        setSelectedSquare(square);
        return;
      }

      // Clicked the same square — deselect
      if (square === selectedSquare) {
        setSelectedSquare(null);
        return;
      }

      // Clicked another own piece — change selection
      if (clickedPiece && pieceBelongsToColor(clickedPiece, session.color)) {
        setSelectedSquare(square);
        return;
      }

      // Attempt the move
      try {
        setIsMakingMove(true);
        const updatedGame = await makeMove(gameId, {
          from: selectedSquare,
          to: square,
          playerId: session.playerId,
          sessionToken: session.sessionToken,
        });

        setGame(updatedGame);
        setSelectedSquare(null);
      } catch (err) {
        // KEY BUG FIX: distinguish illegal moves from real failures
        if (err instanceof ApiError && err.kind === "validation") {
          // Illegal move — clear selection silently (or show toast)
          setSelectedSquare(null);
        } else {
          setError(err instanceof Error ? err.message : "Failed to make move.");
          setSelectedSquare(null);
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
