export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
export type PieceColor = "white" | "black";

export type BoardPiece = {
  type: PieceType;
  color: PieceColor;
};

export type BoardPosition = Record<string, BoardPiece>;

const files = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

const fenPieceMap: Record<string, BoardPiece> = {
  p: { type: "pawn", color: "black" },
  r: { type: "rook", color: "black" },
  n: { type: "knight", color: "black" },
  b: { type: "bishop", color: "black" },
  q: { type: "queen", color: "black" },
  k: { type: "king", color: "black" },
  P: { type: "pawn", color: "white" },
  R: { type: "rook", color: "white" },
  N: { type: "knight", color: "white" },
  B: { type: "bishop", color: "white" },
  Q: { type: "queen", color: "white" },
  K: { type: "king", color: "white" },
};

const backRank: PieceType[] = [
  "rook",
  "knight",
  "bishop",
  "queen",
  "king",
  "bishop",
  "knight",
  "rook",
];

export function createStartPosition(): BoardPosition {
  const position: BoardPosition = {};

  for (let col = 0; col < 8; col++) {
    const file = files[col];

    position[`${file}8`] = { type: backRank[col], color: "black" };
    position[`${file}7`] = { type: "pawn", color: "black" };
    position[`${file}2`] = { type: "pawn", color: "white" };
    position[`${file}1`] = { type: backRank[col], color: "white" };
  }

  return position;
}

export function parseFenBoard(boardFen: string): BoardPosition {
  const position: BoardPosition = {};
  const ranks = boardFen.trim().split("/");

  if (ranks.length !== 8) {
    throw new Error("Invalid FEN board: expected 8 ranks.");
  }

  for (let row = 0; row < 8; row++) {
    const rank = ranks[row];
    let col = 0;

    for (const char of rank) {
      const emptySquares = Number(char);

      if (!Number.isNaN(emptySquares) && emptySquares > 0) {
        col += emptySquares;
        continue;
      }

      const piece = fenPieceMap[char];

      if (!piece) {
        throw new Error(`Invalid FEN board: unknown piece "${char}".`);
      }

      if (col > 7) {
        throw new Error("Invalid FEN board: too many files in rank.");
      }

      const square = `${files[col]}${8 - row}`;
      position[square] = piece;
      col += 1;
    }

    if (col !== 8) {
      throw new Error("Invalid FEN board: rank does not contain 8 files.");
    }
  }

  return position;
}

export function getBoardPositionFromGameState(currentFen?: string | null): BoardPosition {
  if (!currentFen || currentFen === "startpos") {
    return createStartPosition();
  }

  try {
    const trimmed = currentFen.trim();

    const boardPart = trimmed.includes(" ") ? trimmed.split(" ")[0] : trimmed;

    return parseFenBoard(boardPart);
  } catch (error) {
    console.warn("Failed to parse currentFen, falling back to start position.", error);
    return createStartPosition();
  }
}
