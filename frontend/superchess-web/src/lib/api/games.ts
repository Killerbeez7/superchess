import { apiFetch } from "./client";
import type { GameResponse, GameSessionResponse } from "@/types/game";

export type MakeMoveRequest = {
  from: string;
  to: string;
  promotion?: string | null;
  playerId: string;
  sessionToken: string;
};

export const getGames = () => apiFetch<GameResponse[]>("/games");

export const getGame = (gameId: string) => apiFetch<GameResponse>(`/games/${gameId}`);

export const createGame = (playerName: string) =>
  apiFetch<GameSessionResponse>("/games", {
    method: "POST",
    body: JSON.stringify({ playerName }),
  });

export const joinGame = (
  gameId: string,
  playerName: string,
  existingSessionToken?: string
) =>
  apiFetch<GameSessionResponse>(`/games/${gameId}/join`, {
    method: "POST",
    body: JSON.stringify({
      playerName,
      existingSessionToken: existingSessionToken ?? null,
    }),
  });

export const makeMove = (gameId: string, request: MakeMoveRequest) =>
  apiFetch<GameResponse>(`/games/${gameId}/move`, {
    method: "POST",
    body: JSON.stringify({ ...request, promotion: request.promotion ?? null }),
  });
