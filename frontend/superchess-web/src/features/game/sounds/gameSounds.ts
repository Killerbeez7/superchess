export type GameSoundName =
  | "game-start"
  | "game-end"
  | "capture"
  | "castle"
  | "premove"
  | "move-self"
  | "move-opponent"
  | "move-check"
  | "promote"
  | "notify"
  | "illegal"
  | "tenseconds";

const SOUND_BASE_PATH = "/sounds/chess-fixed";

export const SOUND_PATHS: Record<GameSoundName, string> = {
  "game-start": `${SOUND_BASE_PATH}/game-start.mp3`,
  "game-end": `${SOUND_BASE_PATH}/game-end.mp3`,
  capture: `${SOUND_BASE_PATH}/capture.mp3`,
  castle: `${SOUND_BASE_PATH}/castle.mp3`,
  premove: `${SOUND_BASE_PATH}/premove.mp3`,
  "move-self": `${SOUND_BASE_PATH}/move-self.mp3`,
  "move-opponent": `${SOUND_BASE_PATH}/move-opponent.mp3`,
  "move-check": `${SOUND_BASE_PATH}/move-check.mp3`,
  promote: `${SOUND_BASE_PATH}/promote.mp3`,
  notify: `${SOUND_BASE_PATH}/notify.mp3`,
  illegal: `${SOUND_BASE_PATH}/illegal.mp3`,
  tenseconds: `${SOUND_BASE_PATH}/tenseconds.mp3`,
};

export const SOUND_VOLUME: Record<GameSoundName, number> = {
  "game-start": 0.72,
  "game-end": 0.62,
  capture: 0.7,
  castle: 0.68,
  premove: 0.62,
  "move-self": 0.75,
  "move-opponent": 0.7,
  "move-check": 0.62,
  promote: 0.68,
  notify: 0.62,
  illegal: 0.42,
  tenseconds: 0.65,
};

export const CORE_PRELOAD_SOUNDS: GameSoundName[] = [
  "move-self",
  "move-opponent",
  "capture",
  "move-check",
  "game-start",
];

export const JOIN_PRELOAD_SOUNDS: GameSoundName[] = [
  "game-start",
  "move-self",
  "move-opponent",
  "capture",
  "move-check",
  "game-end",
];

export const ACTIVE_GAME_PRELOAD_SOUNDS: GameSoundName[] = [
  "castle",
  "promote",
  "game-end",
  "illegal",
];
