import type { PlayerIdentity } from "@/types/player";

const PLAYER_IDENTITY_KEY = "superchess.playerIdentity";

export function getPlayerIdentity(): PlayerIdentity | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(PLAYER_IDENTITY_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PlayerIdentity;

    if (!parsed?.displayName) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function savePlayerIdentity(identity: PlayerIdentity): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PLAYER_IDENTITY_KEY, JSON.stringify(identity));
}

export function clearPlayerIdentity(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PLAYER_IDENTITY_KEY);
}

export function createLocalPlayerIdentity(displayName: string): PlayerIdentity {
  return {
    displayName,
  };
}
