export type PieceColor = "white" | "black";
export type GameStatus = "waiting" | "active" | "completed" | "abandoned";
export type GameKind = "online" | "bot";
export type GameEndReason = "checkmate" | "stalemate" | "timeout";
export type TimeControlType = "bullet" | "blitz" | "rapid";
export type PieceType = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";
export type PromotionPiece = "q" | "r" | "b" | "n";

export type PlayerSummary = {
  id: string;
  displayName: string;
  isBot: boolean;
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
  kind: GameKind;
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
  color: PieceColor;
};

export type GameSessionResponse = {
  game: GameResponse;
  playerId: string;
  color: PieceColor;
};

export type GameHistoryResult =
  | "win"
  | "loss"
  | "draw"
  | "waiting"
  | "active"
  | "abandoned";

export type GameHistoryResponse = {
  id: string;
  status: GameStatus;
  kind: GameKind;
  playerColor: PieceColor;
  result: GameHistoryResult;
  winnerColor: PieceColor | null;
  whitePlayerName: string;
  blackPlayerName: string;
  opponentUserId: string | null;
  opponentName: string;
  opponentIsBot: boolean;
  initialClockMs: number;
  incrementMs: number;
  timeControlType: TimeControlType;
  isRated: boolean;
  moveCount: number;
  endReason: GameEndReason | null;
  createdAtUtc: string;
  updatedAtUtc: string;
};

export type GameStatsResponse = {
  games: number;
  wins: number;
  draws: number;
  losses: number;
};
