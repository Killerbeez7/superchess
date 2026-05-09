import type { BoardPosition, BoardPiece } from "./position";
import { getBoardPositionFromGameState } from "./position";
import type { PieceColor, GameStatus } from "@/types/games";

export type LastMove = {
  from: string;
  to: string;
} | null;

export function getPieceAtSquare(
  position: BoardPosition | undefined,
  square: string
): BoardPiece | null {
  if (!position) return null;
  return position[square] ?? null;
}

export function pieceBelongsToColor(piece: BoardPiece, color: PieceColor) {
  return piece.color === color;
}

export function squareToCoords(square: string) {
  const col = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  return { row: 8 - rank, col };
}

export function coordsToSquare(row: number, col: number) {
  if (row < 0 || row > 7 || col < 0 || col > 7) return null;
  return `${String.fromCharCode(97 + col)}${8 - row}`;
}

export function getCandidateSquares(
  position: BoardPosition | undefined,
  from: string,
  piece: BoardPiece
): string[] {
  if (!position) return [];

  const fromCoords = squareToCoords(from);
  const results: string[] = [];

  const pushIfValid = (row: number, col: number) => {
    const square = coordsToSquare(row, col);
    if (!square) return false;

    const targetPiece = position[square] ?? null;

    if (!targetPiece) {
      results.push(square);
      return true;
    }

    if (targetPiece.color !== piece.color) {
      results.push(square);
    }

    return false;
  };

  const pushRay = (rowStep: number, colStep: number) => {
    let row = fromCoords.row + rowStep;
    let col = fromCoords.col + colStep;

    while (true) {
      const square = coordsToSquare(row, col);
      if (!square) break;

      const shouldContinue = pushIfValid(row, col);
      if (!shouldContinue) break;

      row += rowStep;
      col += colStep;
    }
  };

  if (piece.type === "pawn") {
    const direction = piece.color === "white" ? -1 : 1;
    const startRow = piece.color === "white" ? 6 : 1;

    const oneForward = coordsToSquare(fromCoords.row + direction, fromCoords.col);
    if (oneForward && !position[oneForward]) {
      results.push(oneForward);

      const twoForward = coordsToSquare(fromCoords.row + direction * 2, fromCoords.col);
      if (fromCoords.row === startRow && twoForward && !position[twoForward]) {
        results.push(twoForward);
      }
    }

    for (const colOffset of [-1, 1] as const) {
      const captureSquare = coordsToSquare(
        fromCoords.row + direction,
        fromCoords.col + colOffset
      );

      if (!captureSquare) continue;

      const targetPiece = position[captureSquare] ?? null;
      if (targetPiece && targetPiece.color !== piece.color) {
        results.push(captureSquare);
      }
    }

    return results;
  }

  if (piece.type === "knight") {
    const jumps = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ] as const;

    for (const [rowOffset, colOffset] of jumps) {
      pushIfValid(fromCoords.row + rowOffset, fromCoords.col + colOffset);
    }

    return results;
  }

  if (piece.type === "bishop") {
    pushRay(-1, -1);
    pushRay(-1, 1);
    pushRay(1, -1);
    pushRay(1, 1);
    return results;
  }

  if (piece.type === "rook") {
    pushRay(-1, 0);
    pushRay(1, 0);
    pushRay(0, -1);
    pushRay(0, 1);
    return results;
  }

  if (piece.type === "queen") {
    pushRay(-1, -1);
    pushRay(-1, 1);
    pushRay(1, -1);
    pushRay(1, 1);
    pushRay(-1, 0);
    pushRay(1, 0);
    pushRay(0, -1);
    pushRay(0, 1);
    return results;
  }

  if (piece.type === "king") {
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let colOffset = -1; colOffset <= 1; colOffset++) {
        if (rowOffset === 0 && colOffset === 0) continue;
        pushIfValid(fromCoords.row + rowOffset, fromCoords.col + colOffset);
      }
    }

    return results;
  }

  return results;
}

export function inferLastMoveFromFens(previousFen?: string, nextFen?: string): LastMove {
  if (!previousFen || !nextFen) return null;

  const previousPosition = getBoardPositionFromGameState(previousFen);
  const nextPosition = getBoardPositionFromGameState(nextFen);

  const allSquares = new Set([
    ...Object.keys(previousPosition ?? {}),
    ...Object.keys(nextPosition ?? {}),
  ]);

  const changedSquares = Array.from(allSquares).filter((square) => {
    const before = previousPosition?.[square] ?? null;
    const after = nextPosition?.[square] ?? null;

    if (!before && !after) return false;
    if (!before || !after) return true;

    return before.type !== after.type || before.color !== after.color;
  });

  if (changedSquares.length < 2) return null;

  let from: string | null = null;
  let to: string | null = null;

  for (const square of changedSquares) {
    const before = previousPosition?.[square] ?? null;
    const after = nextPosition?.[square] ?? null;

    if (before && !after) {
      from = square;
      continue;
    }

    if (
      (!before && after) ||
      (before && after && (before.type !== after.type || before.color !== after.color))
    ) {
      to = square;
    }
  }

  if (!from || !to) return null;

  return { from, to };
}
