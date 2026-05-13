import type { BoardPosition, BoardPiece } from "./position";
import { getBoardPositionFromGameState } from "./position";
import type { PieceColor, PromotionPiece } from "@/types/game";

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

export function getEnPassantSquareFromFen(currentFen?: string | null) {
  const square = currentFen?.trim().split(/\s+/)[3];

  return square && /^[a-h][36]$/.test(square) ? square : null;
}

export function getCandidateSquares(
  position: BoardPosition | undefined,
  from: string,
  piece: BoardPiece,
  enPassantSquare?: string | null
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

    if (targetPiece.color !== piece.color && targetPiece.type !== "king") {
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
        continue;
      }

      const capturedPawnSquare = coordsToSquare(
        fromCoords.row,
        fromCoords.col + colOffset
      );
      const capturedPawn = capturedPawnSquare ? position[capturedPawnSquare] : null;

      if (
        captureSquare === enPassantSquare &&
        capturedPawn?.type === "pawn" &&
        capturedPawn.color !== piece.color
      ) {
        results.push(captureSquare);
      }
    }

    return filterKingSafeMoves(position, from, piece, results, enPassantSquare);
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

    return filterKingSafeMoves(position, from, piece, results, enPassantSquare);
  }

  if (piece.type === "bishop") {
    pushRay(-1, -1);
    pushRay(-1, 1);
    pushRay(1, -1);
    pushRay(1, 1);
    return filterKingSafeMoves(position, from, piece, results, enPassantSquare);
  }

  if (piece.type === "rook") {
    pushRay(-1, 0);
    pushRay(1, 0);
    pushRay(0, -1);
    pushRay(0, 1);
    return filterKingSafeMoves(position, from, piece, results, enPassantSquare);
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
    return filterKingSafeMoves(position, from, piece, results, enPassantSquare);
  }

  if (piece.type === "king") {
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let colOffset = -1; colOffset <= 1; colOffset++) {
        if (rowOffset === 0 && colOffset === 0) continue;

        const square = coordsToSquare(
          fromCoords.row + rowOffset,
          fromCoords.col + colOffset
        );
        if (!square) continue;

        const targetPiece = position[square] ?? null;
        if (targetPiece?.color === piece.color || targetPiece?.type === "king") {
          continue;
        }

        if (isKingMoveSafe(position, from, square, piece)) {
          results.push(square);
        }
      }
    }

    return filterKingSafeMoves(position, from, piece, results, enPassantSquare);
  }

  return filterKingSafeMoves(position, from, piece, results, enPassantSquare);
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
  to: string,
  promotion?: PromotionPiece | null
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

    const isPawn = piece.toLowerCase() === "p";
    const targetPiece = board[toCoords.row][toCoords.col];
    const isEnPassantCapture =
      isPawn &&
      fromCoords.col !== toCoords.col &&
      !targetPiece &&
      getEnPassantSquareFromFen(currentFen) === to.trim().toLowerCase();
    const promotionPiece = isPawn
      ? getPromotionPiece(piece, toCoords.row, promotion)
      : null;

    board[fromCoords.row][fromCoords.col] = null;
    board[toCoords.row][toCoords.col] = promotionPiece ?? piece;

    if (isEnPassantCapture) {
      board[fromCoords.row][toCoords.col] = null;
    }

    const nextParts = [...parts];
    nextParts[0] = compressFenBoard(board);

    if (nextParts[1] === "w") {
      nextParts[1] = "b";
    } else if (nextParts[1] === "b") {
      nextParts[1] = "w";
    }

    if (nextParts.length >= 4) {
      const enPassantTarget =
        isPawn &&
        fromCoords.col === toCoords.col &&
        Math.abs(fromCoords.row - toCoords.row) === 2
          ? coordsToSquare((fromCoords.row + toCoords.row) / 2, fromCoords.col)
          : null;

      nextParts[3] = enPassantTarget ?? "-";
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

function oppositeColor(color: PieceColor): PieceColor {
  return color === "white" ? "black" : "white";
}

function filterKingSafeMoves(
  position: BoardPosition,
  from: string,
  piece: BoardPiece,
  candidateSquares: string[],
  enPassantSquare?: string | null
) {
  if (piece.type !== "king" && !findKingSquare(position, piece.color)) {
    return candidateSquares;
  }

  return candidateSquares.filter((to) =>
    doesMoveKeepKingSafe(position, from, to, piece, enPassantSquare)
  );
}

function findKingSquare(position: BoardPosition, color: PieceColor) {
  return Object.entries(position).find(
    ([, piece]) => piece.type === "king" && piece.color === color
  )?.[0] ?? null;
}

function doesMoveKeepKingSafe(
  position: BoardPosition,
  from: string,
  to: string,
  piece: BoardPiece,
  enPassantSquare?: string | null
) {
  const targetPiece = position[to] ?? null;
  if (targetPiece?.type === "king") {
    return false;
  }

  const nextPosition = { ...position };
  const fromCoords = squareToCoords(from);
  const toCoords = squareToCoords(to);
  const isEnPassantCapture =
    piece.type === "pawn" &&
    fromCoords.col !== toCoords.col &&
    !targetPiece &&
    to === enPassantSquare;

  delete nextPosition[from];
  nextPosition[to] = piece;

  if (isEnPassantCapture) {
    const capturedPawnSquare = coordsToSquare(fromCoords.row, toCoords.col);
    if (capturedPawnSquare) {
      delete nextPosition[capturedPawnSquare];
    }
  }

  const kingSquare =
    piece.type === "king" ? to : findKingSquare(nextPosition, piece.color);

  if (!kingSquare) {
    return true;
  }

  return !isSquareAttackedBy(nextPosition, kingSquare, oppositeColor(piece.color));
}

function isKingMoveSafe(
  position: BoardPosition,
  from: string,
  to: string,
  king: BoardPiece
) {
  const nextPosition = { ...position };
  delete nextPosition[from];
  nextPosition[to] = king;

  return !isSquareAttackedBy(nextPosition, to, oppositeColor(king.color));
}

function isSquareAttackedBy(
  position: BoardPosition,
  square: string,
  attackingColor: PieceColor
) {
  const targetCoords = squareToCoords(square);

  for (const [from, piece] of Object.entries(position)) {
    if (piece.color !== attackingColor) continue;

    const fromCoords = squareToCoords(from);
    const rowDelta = targetCoords.row - fromCoords.row;
    const colDelta = targetCoords.col - fromCoords.col;
    const absRowDelta = Math.abs(rowDelta);
    const absColDelta = Math.abs(colDelta);

    if (piece.type === "pawn") {
      const direction = piece.color === "white" ? -1 : 1;
      if (rowDelta === direction && absColDelta === 1) return true;
      continue;
    }

    if (piece.type === "knight") {
      if (
        (absRowDelta === 2 && absColDelta === 1) ||
        (absRowDelta === 1 && absColDelta === 2)
      ) {
        return true;
      }
      continue;
    }

    if (piece.type === "king") {
      if (absRowDelta <= 1 && absColDelta <= 1) return true;
      continue;
    }

    if (
      piece.type === "bishop" &&
      absRowDelta === absColDelta &&
      isPathClearBetween(position, fromCoords, targetCoords)
    ) {
      return true;
    }

    if (
      piece.type === "rook" &&
      (rowDelta === 0 || colDelta === 0) &&
      isPathClearBetween(position, fromCoords, targetCoords)
    ) {
      return true;
    }

    if (
      piece.type === "queen" &&
      (rowDelta === 0 ||
        colDelta === 0 ||
        absRowDelta === absColDelta) &&
      isPathClearBetween(position, fromCoords, targetCoords)
    ) {
      return true;
    }
  }

  return false;
}

function isPathClearBetween(
  position: BoardPosition,
  fromCoords: { row: number; col: number },
  toCoords: { row: number; col: number }
) {
  const rowStep = Math.sign(toCoords.row - fromCoords.row);
  const colStep = Math.sign(toCoords.col - fromCoords.col);
  let row = fromCoords.row + rowStep;
  let col = fromCoords.col + colStep;

  while (row !== toCoords.row || col !== toCoords.col) {
    const square = coordsToSquare(row, col);
    if (square && position[square]) return false;

    row += rowStep;
    col += colStep;
  }

  return true;
}

function getPromotionPiece(
  pawn: string,
  targetRow: number,
  promotion?: PromotionPiece | null
) {
  const promotionPieces: Record<PromotionPiece, string> = {
    q: "q",
    r: "r",
    b: "b",
    n: "n",
  };
  const isWhite = pawn === "P";
  const promotionRow = isWhite ? 0 : 7;

  if (targetRow !== promotionRow || !promotion) {
    return null;
  }

  const piece = promotionPieces[promotion];
  return isWhite ? piece.toUpperCase() : piece;
}
