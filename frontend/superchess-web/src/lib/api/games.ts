import { apiFetch } from "./client";
import type {
  GameHistoryResponse,
  GameResponse,
  GameSessionResponse,
  MoveSummary,
  PieceColor,
} from "@/types/game";

export type MakeMoveRequest = {
  from: string;
  to: string;
  promotion?: string | null;
};

export type CreateGameRequest = {
  initialMinutes: number;
  incrementSeconds: number;
  isRated: boolean;
  gameMode: string;
};

export type CreateAiGameRequest = CreateGameRequest & {
  botLevel: 1 | 2 | 3;
  playerColor: PieceColor;
};

type ApiPieceColor = PieceColor | "White" | "Black" | 0 | 1;

type ApiMoveSummary = Omit<MoveSummary, "playerColor"> & {
  playerColor: ApiPieceColor;
};

type ApiGameResponse = Omit<GameResponse, "moves"> & {
  moves: ApiMoveSummary[];
};

type ApiGameSessionResponse = Omit<GameSessionResponse, "game" | "color"> & {
  game: ApiGameResponse;
  color: ApiPieceColor;
};

type ApiGameHistoryResponse = Omit<GameHistoryResponse, "playerColor"> & {
  playerColor: ApiPieceColor;
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

function normalizeGameSessionResponse(
  response: ApiGameSessionResponse
): GameSessionResponse {
  return {
    ...response,
    color: normalizePieceColor(response.color),
    game: normalizeGameResponse(response.game),
  };
}

function normalizeGameHistoryResponse(
  response: ApiGameHistoryResponse
): GameHistoryResponse {
  return {
    ...response,
    playerColor: normalizePieceColor(response.playerColor),
  };
}

function authHeaders(accessToken?: string): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const getGames = async () =>
  normalizeGameResponses(await apiFetch<ApiGameResponse[]>("/api/games"));

export const getGame = async (gameId: string) =>
  normalizeGameResponse(await apiFetch<ApiGameResponse>(`/api/games/${gameId}`));

export const getGameHistory = (accessToken: string) =>
  apiFetch<ApiGameHistoryResponse[]>("/api/games/history", {
    headers: authHeaders(accessToken),
  }).then((games) => games.map(normalizeGameHistoryResponse));

export const createGame = (accessToken: string, request?: CreateGameRequest) =>
  apiFetch<ApiGameSessionResponse>("/api/games", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(request ?? {}),
  }).then(normalizeGameSessionResponse);

export const createAiGame = (accessToken: string, request?: CreateAiGameRequest) =>
  apiFetch<ApiGameSessionResponse>("/api/games/ai", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(request ?? {}),
  }).then(normalizeGameSessionResponse);

export const joinGame = (gameId: string, accessToken: string) =>
  apiFetch<ApiGameSessionResponse>(`/api/games/${gameId}/join`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({}),
  }).then(normalizeGameSessionResponse);

export const makeMove = (gameId: string, accessToken: string, request: MakeMoveRequest) =>
  apiFetch<ApiGameResponse>(`/api/games/${gameId}/moves`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ ...request, promotion: request.promotion ?? null }),
  }).then(normalizeGameResponse);
