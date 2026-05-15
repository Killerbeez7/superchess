"use client";

import { useCallback, useState } from "react";
import { joinGame, makeMove } from "@/lib/api/games";
import { ApiError } from "@/lib/api/client";
import {
  applyOptimisticMoveToFen,
  getCandidateSquares,
  getPieceAtSquare,
  pieceBelongsToColor,
} from "@/utils/board/interactions";
import type { GameResponse, PieceColor, PromotionPiece } from "@/types/game";
import type { LocalGameSession } from "@/lib/storage/gameSession";
import type { BoardPiece, BoardPosition } from "@/utils/board/position";

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
  enPassantSquare: string | null;
  onIllegalMove?: () => void;
  onOptimisticMove?: (move: {
    from: string;
    to: string;
    promotion?: PromotionPiece;
    optimisticFen: string;
  }) => void;
  onGameStarted?: () => void;
};

type PendingPromotionMove = {
  from: string;
  to: string;
  color: PieceColor;
};

function isPromotionMove(piece: BoardPiece, to: string) {
  return (
    piece.type === "pawn" &&
    ((piece.color === "white" && to.endsWith("8")) ||
      (piece.color === "black" && to.endsWith("1")))
  );
}

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
  enPassantSquare,
  onIllegalMove,
  onOptimisticMove,
  onGameStarted,
}: UseGameActionsArgs) {
  const [isJoining, setIsJoining] = useState(false);
  const [isMakingMove, setIsMakingMove] = useState(false);
  const [pendingPromotionMove, setPendingPromotionMove] =
    useState<PendingPromotionMove | null>(null);

  const isLocalPlayersTurn = !!session && !!game && session.color === game.whoseTurn;

  const canInteractWithBoard =
    !!game &&
    !!session &&
    game.status === "active" &&
    isLocalPlayersTurn &&
    !isMakingMove &&
    !pendingPromotionMove;

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
        setPendingPromotionMove(null);
        setSelectedSquare(null);

        if (game?.status === "waiting" && result.game.status === "active") {
          onGameStarted?.();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to join game.");
      } finally {
        setIsJoining(false);
      }
    },
    [
      gameId,
      game?.status,
      session,
      saveSession,
      setGame,
      setError,
      setOptimisticFen,
      setSelectedSquare,
      onGameStarted,
    ]
  );

  const submitMove = useCallback(
    async (from: string, to: string, promotion?: PromotionPiece) => {
      if (!gameId || !game || !session) return;

      try {
        setError(null);
        setIsMakingMove(true);

        const optimisticNextFen = applyOptimisticMoveToFen(
          game.currentFen,
          from,
          to,
          promotion
        );
        setOptimisticFen(optimisticNextFen);
        setSelectedSquare(null);
        onOptimisticMove?.({ from, to, promotion, optimisticFen: optimisticNextFen });

        const updatedGame = await makeMove(gameId, {
          from,
          to,
          promotion,
          playerId: session.playerId,
          sessionToken: session.sessionToken,
        });

        setGame(updatedGame);
        setOptimisticFen(null);
      } catch (err) {
        setOptimisticFen(null);
        setSelectedSquare(null);

        if (err instanceof ApiError && err.kind === "validation") {
          onIllegalMove?.();
        } else {
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
      setGame,
      setError,
      setOptimisticFen,
      setSelectedSquare,
      onIllegalMove,
      onOptimisticMove,
    ]
  );

  const handleMoveAttempt = useCallback(
    async (from: string, to: string) => {
      if (!gameId || !game || !session || !canInteractWithBoard) return;
      if (from === to) {
        setSelectedSquare(null);
        return;
      }

      const movingPiece = getPieceAtSquare(boardPosition, from);
      const targetPiece = getPieceAtSquare(boardPosition, to);

      if (!movingPiece || !pieceBelongsToColor(movingPiece, session.color)) {
        onIllegalMove?.();
        setSelectedSquare(null);
        return;
      }

      if (targetPiece && pieceBelongsToColor(targetPiece, session.color)) {
        onIllegalMove?.();
        setSelectedSquare(null);
        return;
      }

      const candidates = getCandidateSquares(
        boardPosition,
        from,
        movingPiece,
        enPassantSquare
      );
      if (!candidates.includes(to)) {
        onIllegalMove?.();
        setSelectedSquare(null);
        return;
      }

      if (isPromotionMove(movingPiece, to)) {
        setError(null);
        setPendingPromotionMove({ from, to, color: movingPiece.color });
        setSelectedSquare(null);
        return;
      }

      await submitMove(from, to);
    },
    [
      gameId,
      game,
      session,
      canInteractWithBoard,
      boardPosition,
      enPassantSquare,
      setError,
      setSelectedSquare,
      submitMove,
      onIllegalMove,
    ]
  );

  const handlePromotionSelect = useCallback(
    async (promotion: PromotionPiece) => {
      const move = pendingPromotionMove;
      if (!move || isMakingMove) return;

      setPendingPromotionMove(null);
      await submitMove(move.from, move.to, promotion);
    },
    [isMakingMove, pendingPromotionMove, submitMove]
  );

  const handlePromotionCancel = useCallback(() => {
    setPendingPromotionMove(null);
    setSelectedSquare(null);
  }, [setSelectedSquare]);

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

      await handleMoveAttempt(selectedSquare, square);
    },
    [
      gameId,
      game,
      session,
      canInteractWithBoard,
      boardPosition,
      selectedSquare,
      setError,
      setSelectedSquare,
      handleMoveAttempt,
    ]
  );

  return {
    handleJoin,
    handleSquareClick,
    handleMoveAttempt,
    handlePromotionSelect,
    handlePromotionCancel,
    pendingPromotionMove,
    isJoining,
    isMakingMove,
    canInteractWithBoard,
  };
}
