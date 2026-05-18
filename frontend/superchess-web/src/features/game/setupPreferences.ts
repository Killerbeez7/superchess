import type { UserGameSettings } from "@/features/auth/api/auth";
import type { CreateGameRequest } from "@/lib/api/games";

export const DEFAULT_GAME_SETTINGS: UserGameSettings = {
  initialMinutes: 5,
  incrementSeconds: 0,
  isRated: false,
  gameMode: "classical",
};

export function toCreateGameRequest(
  settings: UserGameSettings = DEFAULT_GAME_SETTINGS
): CreateGameRequest {
  return {
    initialMinutes: settings.initialMinutes,
    incrementSeconds: settings.incrementSeconds,
    isRated: settings.isRated,
    gameMode: settings.gameMode,
  };
}

function getTimeControlLabel(settings: UserGameSettings) {
  return settings.incrementSeconds > 0
    ? `${settings.initialMinutes} | ${settings.incrementSeconds}`
    : `${settings.initialMinutes} min`;
}

function getTimeControlTypeLabel(settings: UserGameSettings) {
  if (settings.initialMinutes < 3) return "Bullet";
  if (settings.initialMinutes < 10) return "Blitz";
  return "Rapid";
}

export function formatGameSetupSummary(
  settings: UserGameSettings = DEFAULT_GAME_SETTINGS
) {
  const ratingLabel = settings.isRated ? "Rated" : "Casual";

  return `${getTimeControlLabel(settings)} · ${getTimeControlTypeLabel(
    settings
  )} · ${ratingLabel}`;
}
