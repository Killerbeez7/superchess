export type PieceColor = "white" | "black";
export type GameStatus = "waiting" | "active" | "completed" | "abandoned";
export type GameEndReason = "checkmate" | "stalemate" | "timeout";
export type TimeControlType = "bullet" | "blitz" | "rapid";
export type PieceType = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";
export type PromotionPiece = "q" | "r" | "b" | "n";

export type PlayerSummary = {
  id: string;
  displayName: string;
};

export type MoveSummary = {
  moveNumber: number;
  from: string;
  to: string;
  playerColor: PieceColor;
  createdAtUtc: string;
};

export type GameResponse = {
  id: string;
  status: GameStatus;
  currentFen: string;
  whoseTurn: PieceColor;
  initialClockMs: number;
  incrementMs: number;
  timeControlType: TimeControlType;
  isRated: boolean;
  whiteTimeRemainingMs: number;
  blackTimeRemainingMs: number;
  turnStartedAtUtc: string | null;
  endReason: GameEndReason | null;
  winnerColor: PieceColor | null;
  whitePlayer: PlayerSummary;
  blackPlayer: PlayerSummary | null;
  createdAtUtc: string;
  updatedAtUtc: string;
  moves: MoveSummary[];
};

export type PlayerSession = {
  playerId: string;
  sessionToken: string;
  color: PieceColor;
};

export type GameSessionResponse = {
  game: GameResponse;
  session: PlayerSession;
};
