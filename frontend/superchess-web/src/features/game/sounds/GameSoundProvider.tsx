"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { Howl, Howler } from "howler";
import {
  CORE_PRELOAD_SOUNDS,
  SOUND_PATHS,
  SOUND_VOLUME,
  type GameSoundName,
} from "@/features/game/sounds/gameSounds";

type SoundRegistry = Partial<Record<GameSoundName, Howl>>;

type GameSoundContextValue = {
  playSound: (name: GameSoundName) => void;
  playSounds: (sounds: GameSoundName[], delayMs?: number) => void;
  preloadSound: (name: GameSoundName) => void;
  preloadSounds: (names: GameSoundName[]) => void;
  unlockSounds: () => void;
};

const GameSoundContext = createContext<GameSoundContextValue | null>(null);

function createHowl(name: GameSoundName) {
  return new Howl({
    src: [SOUND_PATHS[name]],
    preload: true,
    volume: SOUND_VOLUME[name],
    html5: false,
  });
}

export function GameSoundProvider({ children }: { children: ReactNode }) {
  const soundsRef = useRef<SoundRegistry>({});
  const isUnlockedRef = useRef(false);

  const ensureSound = useCallback((name: GameSoundName) => {
    const existing = soundsRef.current[name];

    if (existing) return existing;

    const sound = createHowl(name);
    soundsRef.current[name] = sound;
    return sound;
  }, []);

  const preloadSound = useCallback(
    (name: GameSoundName) => {
      ensureSound(name);
    },
    [ensureSound]
  );

  const preloadSounds = useCallback(
    (names: GameSoundName[]) => {
      names.forEach(preloadSound);
    },
    [preloadSound]
  );

  useEffect(() => {
    preloadSounds(CORE_PRELOAD_SOUNDS);

    return () => {
      Object.values(soundsRef.current).forEach((sound) => {
        sound?.unload();
      });

      soundsRef.current = {};
      isUnlockedRef.current = false;
    };
  }, [preloadSounds]);

  const unlockSounds = useCallback(() => {
    if (isUnlockedRef.current) return;

    try {
      void Howler.ctx?.resume?.();
    } catch {
      // Some browsers do not expose/resume AudioContext.
    }

    const sound = ensureSound("move-self");
    const id = sound.play();

    sound.volume(0, id);

    window.setTimeout(() => {
      sound.stop(id);
      sound.volume(SOUND_VOLUME["move-self"], id);
      isUnlockedRef.current = true;
    }, 40);
  }, [ensureSound]);

  const playSound = useCallback(
    (name: GameSoundName) => {
      const sound = ensureSound(name);
      const id = sound.play();

      sound.volume(SOUND_VOLUME[name], id);
    },
    [ensureSound]
  );

  const playSounds = useCallback(
    (sounds: GameSoundName[], delayMs = 220) => {
      sounds.forEach((sound, index) => {
        if (index === 0) {
          playSound(sound);
          return;
        }

        window.setTimeout(() => {
          playSound(sound);
        }, delayMs * index);
      });
    },
    [playSound]
  );

  const value = useMemo(
    () => ({
      playSound,
      playSounds,
      preloadSound,
      preloadSounds,
      unlockSounds,
    }),
    [playSound, playSounds, preloadSound, preloadSounds, unlockSounds]
  );

  return <GameSoundContext.Provider value={value}>{children}</GameSoundContext.Provider>;
}

export function useGameSounds() {
  const context = useContext(GameSoundContext);

  if (!context) {
    throw new Error("useGameSounds must be used inside GameSoundProvider.");
  }

  return context;
}

export type { GameSoundName };
