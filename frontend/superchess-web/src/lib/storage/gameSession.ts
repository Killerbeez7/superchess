import type { PieceColor } from "@/types/game";

export type StoredGameSession = {
  gameId: string;
  playerId: string;
  color: PieceColor;
  playerName: string;
};

type SessionMap = Record<string, StoredGameSession>;

const STORAGE_KEY = "superchess.sessions";
const MATCHMAKING_STORAGE_KEY = "superchess.matchmakingSearchGames";

function readSessions(): SessionMap {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    return JSON.parse(raw) as SessionMap;
  } catch {
    return {};
  }
}

function writeSessions(sessions: SessionMap) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function saveGameSession(session: StoredGameSession) {
  const sessions = readSessions();
  sessions[session.gameId] = session;
  writeSessions(sessions);
}

export function getGameSession(gameId: string): StoredGameSession | null {
  const sessions = readSessions();
  return sessions[gameId] ?? null;
}

export function removeGameSession(gameId: string) {
  const sessions = readSessions();
  delete sessions[gameId];
  writeSessions(sessions);
}

function readMatchmakingSearchGames(): Record<string, true> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.sessionStorage.getItem(MATCHMAKING_STORAGE_KEY);
    if (!raw) return {};

    return JSON.parse(raw) as Record<string, true>;
  } catch {
    return {};
  }
}

function writeMatchmakingSearchGames(games: Record<string, true>) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(MATCHMAKING_STORAGE_KEY, JSON.stringify(games));
}

export function markGameMatchmakingSearch(gameId: string) {
  const games = readMatchmakingSearchGames();
  games[gameId] = true;
  writeMatchmakingSearchGames(games);
}

export function hasGameMatchmakingSearch(gameId: string) {
  const games = readMatchmakingSearchGames();
  return games[gameId] === true;
}

export function clearGameMatchmakingSearch(gameId: string) {
  const games = readMatchmakingSearchGames();
  delete games[gameId];
  writeMatchmakingSearchGames(games);
}
