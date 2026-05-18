import { API_BASE_URL } from "@/lib/api/client";

export type UserGameSettings = {
  initialMinutes: number;
  incrementSeconds: number;
  isRated: boolean;
  gameMode: string;
};

export type CurrentUser = {
  id: string;
  displayName: string;
  email: string;
  lastGameSettings: UserGameSettings;
};

export type AuthResponse = {
  accessToken: string;
  user: CurrentUser;
};

export type RegisterRequest = {
  displayName: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

async function parseApiError(response: Response) {
  const text = await response.text();

  if (!text) return "Request failed.";

  try {
    const body = JSON.parse(text) as string | { message?: string };
    if (typeof body === "string") return body;
    return body.message ?? text;
  } catch {
    return text;
  }
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export async function getMe(accessToken: string): Promise<CurrentUser> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}
