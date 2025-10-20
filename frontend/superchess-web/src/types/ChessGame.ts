import { Player, PlayerColor } from "./Player";

export type GameStatus = "waiting" | "active" | "finished" | "aborted";
export type WhoseTurn = "white" | "black" | "none";
export type GameResult = "none" | "whiteWin" | "blackWin" | "draw";
export type GameEndReason =
    | "none"
    | "checkmate"
    | "resignation"
    | "timeout"
    | "stalemate"
    | "agreement"
    | "insufficientMaterial";

export interface MoveRow {
    id: number;
    chessGameId: number;
    moveNumber: number;
    byColor: PlayerColor;
    from: string;
    to: string;
    promotion?: string | null;
    san?: string | null;
    uci?: string | null;
    playedAt: string;
}

export interface ChessGame {
    id: number;
    title?: string | null;
    player1Id: number;
    player1: Player;
    player2Id?: number | null;
    player2?: Player | null;
    player1Color: PlayerColor;
    player2Color: PlayerColor;
    status: GameStatus;
    whoseTurn: WhoseTurn;
    fen: string;
    pgn?: string | null;
    moves: MoveRow[];
    result: GameResult;
    endReason: GameEndReason;
    timeControlSeconds?: number | null;
    incrementSeconds?: number | null;
    remainingSecondsPlayer1: number;
    remainingSecondsPlayer2: number;
    isRated: boolean;
    allowSpectators: boolean;
    createdAt: string;
    lastMoveAt?: string | null;
}
