export type LocalGameSession = {
  gameId: string;
  playerId: string;
  sessionToken: string;
  color: "white" | "black";
  playerName: string;
};

const STORAGE_KEY = "superchess.sessions";

type SessionMap = Record<string, LocalGameSession>;

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

export function saveGameSession(session: LocalGameSession) {
  const sessions = readSessions();
  sessions[session.gameId] = session;
  writeSessions(sessions);
}

export function getGameSession(gameId: string): LocalGameSession | null {
  const sessions = readSessions();
  return sessions[gameId] ?? null;
}

export function removeGameSession(gameId: string) {
  const sessions = readSessions();
  delete sessions[gameId];
  writeSessions(sessions);
}
