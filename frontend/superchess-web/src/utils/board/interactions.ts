import type { BoardPosition, BoardPiece } from "./position";
import { getBoardPositionFromGameState } from "./position";

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

export function pieceBelongsToColor(piece: BoardPiece, color: "white" | "black") {
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

export function applyOptimisticMoveToFen(
  currentFen: string,
  from: string,
  to: string
): string {
  try {
    const parts = currentFen.trim().split(/\s+/);
    const boardFen = parts[0];

    if (!boardFen) return currentFen;

    const board = expandFenBoard(boardFen);
    const fromCoords = squareToCoords(from.trim().toLowerCase());
    const toCoords = squareToCoords(to.trim().toLowerCase());

    if (!isInsideBoard(fromCoords.row, fromCoords.col)) return currentFen;
    if (!isInsideBoard(toCoords.row, toCoords.col)) return currentFen;

    const piece = board[fromCoords.row][fromCoords.col];
    if (!piece) return currentFen;

    board[fromCoords.row][fromCoords.col] = null;
    board[toCoords.row][toCoords.col] = piece;

    const nextParts = [...parts];
    nextParts[0] = compressFenBoard(board);

    if (nextParts[1] === "w") {
      nextParts[1] = "b";
    } else if (nextParts[1] === "b") {
      nextParts[1] = "w";
    }

    return nextParts.join(" ");
  } catch (error) {
    console.warn("Failed to apply optimistic move.", error);
    return currentFen;
  }
}

function expandFenBoard(boardFen: string): (string | null)[][] {
  return boardFen.split("/").map((rank) => {
    const row: (string | null)[] = [];

    for (const char of rank) {
      const emptySquares = Number(char);

      if (!Number.isNaN(emptySquares) && emptySquares > 0) {
        row.push(...Array<string | null>(emptySquares).fill(null));
        continue;
      }

      row.push(char);
    }

    return row;
  });
}

function compressFenBoard(board: (string | null)[][]) {
  return board
    .map((row) => {
      let emptySquares = 0;
      let rank = "";

      for (const piece of row) {
        if (!piece) {
          emptySquares += 1;
          continue;
        }

        if (emptySquares > 0) {
          rank += emptySquares;
          emptySquares = 0;
        }

        rank += piece;
      }

      return emptySquares > 0 ? `${rank}${emptySquares}` : rank;
    })
    .join("/");
}

function isInsideBoard(row: number, col: number) {
  return row >= 0 && row <= 7 && col >= 0 && col <= 7;
}
