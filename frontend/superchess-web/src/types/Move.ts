import { ChessPiece } from "./Piece";

export interface SquareCoord {
    row: number;
    col: number;
}
export interface LegalMove extends SquareCoord {
    isCapture?: boolean;
}

export interface Move {
    from: SquareCoord;
    to: SquareCoord;
    piece: ChessPiece;
    capturedPiece?: ChessPiece;
    uci: string;
    san?: string;
    promotion?: string;
    timestamp: string | Date;
}
