import { PlayerColor } from "./Player";

export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";


export interface ChessPiece {
    type: PieceType;
    color: PlayerColor;
    hasMoved: boolean;
}