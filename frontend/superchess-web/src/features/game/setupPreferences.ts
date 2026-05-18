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
