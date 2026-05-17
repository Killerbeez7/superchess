import { apiFetch } from "./client";
import type { GameResponse, GameSessionResponse, MoveSummary, PieceColor } from "@/types/game";

export type MakeMoveRequest = {
  from: string;
  to: string;
  promotion?: string | null;
  playerId: string;
  sessionToken: string;
};

type ApiPieceColor = PieceColor | "White" | "Black" | 0 | 1;
type ApiMoveSummary = Omit<MoveSummary, "playerColor"> & {
  playerColor: ApiPieceColor;
};
type ApiGameResponse = Omit<GameResponse, "moves"> & {
  moves: ApiMoveSummary[];
};
type ApiGameSessionResponse = Omit<GameSessionResponse, "game"> & {
  game: ApiGameResponse;
};

function normalizePieceColor(color: ApiPieceColor): PieceColor {
  if (color === "white" || color === "White" || color === 0) return "white";
  return "black";
}

export function normalizeGameResponse(game: ApiGameResponse): GameResponse {
  return {
    ...game,
    moves: game.moves.map((move) => ({
      ...move,
      playerColor: normalizePieceColor(move.playerColor),
    })),
  };
}

export function normalizeGameResponses(games: ApiGameResponse[]): GameResponse[] {
  return games.map(normalizeGameResponse);
}

function normalizeGameSessionResponse(response: ApiGameSessionResponse): GameSessionResponse {
  return {
    ...response,
    game: normalizeGameResponse(response.game),
  };
}

function authHeaders(accessToken?: string): HeadersInit | undefined {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

export const getGames = async () =>
  normalizeGameResponses(await apiFetch<ApiGameResponse[]>("/games"));

export const getGame = async (gameId: string) =>
  normalizeGameResponse(await apiFetch<ApiGameResponse>(`/games/${gameId}`));

export const createGame = (playerName: string, accessToken?: string) =>
  apiFetch<ApiGameSessionResponse>("/games", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ playerName }),
  }).then(normalizeGameSessionResponse);

export const joinGame = (
  gameId: string,
  playerName: string,
  existingSessionToken?: string,
  accessToken?: string
) =>
  apiFetch<ApiGameSessionResponse>(`/games/${gameId}/join`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      playerName,
      existingSessionToken: existingSessionToken ?? null,
    }),
  }).then(normalizeGameSessionResponse);

export const makeMove = (gameId: string, request: MakeMoveRequest) =>
  apiFetch<ApiGameResponse>(`/games/${gameId}/move`, {
    method: "POST",
    body: JSON.stringify({ ...request, promotion: request.promotion ?? null }),
  }).then(normalizeGameResponse);
