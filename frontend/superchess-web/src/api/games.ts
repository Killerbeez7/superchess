const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5199";

export type PlayerSummary = {
  id: string;
  displayName: string;
};

export type GameResponse = {
  id: string;
  status: string;
  currentFen: string;
  whoseTurn: string;
  whitePlayer: PlayerSummary;
  blackPlayer: PlayerSummary | null;
  createdAtUtc: string;
  updatedAtUtc: string;
};

export type PlayerSessionResponse = {
  playerId: string;
  sessionToken: string;
  color: "white" | "black";
};

export type GameSessionResponse = {
  game: GameResponse;
  session: PlayerSessionResponse;
};

type ApiError = {
  message?: string;
};

async function readError(res: Response) {
  try {
    const data = (await res.json()) as ApiError;
    return data.message || "Request failed.";
  } catch {
    return "Request failed.";
  }
}

export async function getGames(): Promise<GameResponse[]> {
  const res = await fetch(`${API_BASE_URL}/games`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await readError(res));
  }

  return res.json();
}

export async function getGame(gameId: string): Promise<GameResponse> {
  const res = await fetch(`${API_BASE_URL}/games/${gameId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await readError(res));
  }

  return res.json();
}

export async function createGame(playerName: string): Promise<GameSessionResponse> {
  const res = await fetch(`${API_BASE_URL}/games`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ playerName }),
  });

  if (!res.ok) {
    throw new Error(await readError(res));
  }

  return res.json();
}

export async function joinGame(
  gameId: string,
  playerName: string,
  existingSessionToken?: string
): Promise<GameSessionResponse> {
  const res = await fetch(`${API_BASE_URL}/games/${gameId}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      playerName,
      existingSessionToken: existingSessionToken ?? null,
    }),
  });

  if (!res.ok) {
    throw new Error(await readError(res));
  }

  return res.json();
}
