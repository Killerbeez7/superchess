export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
export type PieceColor = "white" | "black";

export type BoardPiece = {
  type: PieceType;
  color: PieceColor;
};

export type BoardPosition = Record<string, BoardPiece>;

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

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

export function getBoardPositionFromGameState(currentFen?: string | null): BoardPosition {
  if (!currentFen || currentFen === "startpos") {
    return createStartPosition();
  }

  return createStartPosition();
}
