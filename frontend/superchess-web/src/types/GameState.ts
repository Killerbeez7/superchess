import { ChessBoard } from "./ChessBoard";
import { PlayerColor } from "./Player";
import { Move } from "./Move";
import { SquareCoord } from "./Move";
import { LegalMove } from "./Move";

export type GameStatus = "playing" | "check" | "checkmate" | "stalemate";


export interface GameState {
    board: ChessBoard;
    fen: string;
    currentPlayer: PlayerColor;
    gameStatus: GameStatus;
    moveHistory: Move[];
    selectedSquare?: SquareCoord;
    legalMoves?: LegalMove[];
}