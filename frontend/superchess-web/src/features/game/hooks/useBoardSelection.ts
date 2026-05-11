"use client";

import { useMemo, useState } from "react";
import {
  getCandidateSquares,
  getPieceAtSquare,
  pieceBelongsToColor,
} from "@/utils/board/interactions";
import { getBoardPositionFromGameState } from "@/utils/board/position";
import type { GameResponse } from "@/types/game";
import type { LocalGameSession } from "@/lib/storage/gameSession";

export function useBoardSelection(
  game: GameResponse | null,
  session: LocalGameSession | null
) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const boardPosition = useMemo(
    () => getBoardPositionFromGameState(game?.currentFen),
    [game?.currentFen]
  );

  const selectedPiece = useMemo(
    () => (selectedSquare ? getPieceAtSquare(boardPosition, selectedSquare) : null),
    [boardPosition, selectedSquare]
  );

  const candidateSquares = useMemo(() => {
    if (!selectedSquare || !selectedPiece || !session) return [];
    if (!pieceBelongsToColor(selectedPiece, session.color)) return [];
    return getCandidateSquares(boardPosition, selectedSquare, selectedPiece);
  }, [boardPosition, selectedSquare, selectedPiece, session]);

  const latestMove = game?.moves?.length ? game.moves[game.moves.length - 1] : null;

  return {
    selectedSquare,
    setSelectedSquare,
    boardPosition,
    candidateSquares,
    lastMoveFrom: latestMove?.from ?? null,
    lastMoveTo: latestMove?.to ?? null,
  };
}
