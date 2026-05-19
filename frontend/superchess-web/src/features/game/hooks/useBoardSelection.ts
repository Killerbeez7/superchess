"use client";

import { useMemo, useState } from "react";
import {
  getCandidateSquares,
  getCastlingRightsFromFen,
  getEnPassantSquareFromFen,
  getPieceAtSquare,
  pieceBelongsToColor,
} from "@/utils/board/interactions";
import { getBoardPositionFromGameState } from "@/utils/board/position";
import type { GameResponse } from "@/types/game";
import type { StoredGameSession } from "@/lib/storage/gameSession";

export function useBoardSelection(
  game: GameResponse | null,
  session: StoredGameSession | null,
  displayedFen?: string | null
) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const activeFen = displayedFen ?? game?.currentFen;

  const boardPosition = useMemo(
    () => getBoardPositionFromGameState(activeFen),
    [activeFen]
  );

  const enPassantSquare = useMemo(
    () => getEnPassantSquareFromFen(activeFen),
    [activeFen]
  );

  const castlingRights = useMemo(
    () => getCastlingRightsFromFen(activeFen),
    [activeFen]
  );

  const selectedPiece = useMemo(
    () => (selectedSquare ? getPieceAtSquare(boardPosition, selectedSquare) : null),
    [boardPosition, selectedSquare]
  );

  const candidateSquares = useMemo(() => {
    if (!selectedSquare || !selectedPiece || !session) return [];
    if (!pieceBelongsToColor(selectedPiece, session.color)) return [];
    return getCandidateSquares(
      boardPosition,
      selectedSquare,
      selectedPiece,
      enPassantSquare,
      castlingRights
    );
  }, [boardPosition, castlingRights, enPassantSquare, selectedSquare, selectedPiece, session]);

  const latestMove = game?.moves?.length ? game.moves[game.moves.length - 1] : null;

  return {
    selectedSquare,
    setSelectedSquare,
    boardPosition,
    enPassantSquare,
    castlingRights,
    candidateSquares,
    lastMoveFrom: latestMove?.from ?? null,
    lastMoveTo: latestMove?.to ?? null,
  };
}
