import { PlayerColor } from "./Player";

export interface CreateGameRequest {
    player1DisplayName: string;
    isRated?: boolean;
    baseTimeSeconds?: number;
    incrementSeconds?: number;
    preferredColor?: PlayerColor;
}

export interface JoinGameRequest {
    playerDisplayName: string;
}

export interface MoveActionRequest {
    gameId: number;
    uci: string;
    clientRemainingSeconds?: number;
}

export interface ResignRequest {
    player: "player1" | "player2";
}

export interface DrawOfferRequest {
    player: "player1" | "player2";
}
