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
  prepareSound: (name: GameSoundName) => Promise<void>;
  prepareSounds: (names: GameSoundName[]) => Promise<void>;
  unlockSounds: () => void;
};

const GameSoundContext = createContext<GameSoundContextValue | null>(null);

Howler.autoSuspend = false;

function createHowl(name: GameSoundName) {
  return new Howl({
    src: [SOUND_PATHS[name]],
    preload: true,
    volume: SOUND_VOLUME[name],
    html5: false,
    pool: 4,
    format: ["mp3"],
  });
}

function playSilentBuffer() {
  const ctx = Howler.ctx;
  if (!ctx) return;

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();

  source.buffer = ctx.createBuffer(1, 1, 22050);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(0);
}

export function GameSoundProvider({ children }: { children: ReactNode }) {
  const soundsRef = useRef<SoundRegistry>({});
  const loadPromisesRef = useRef<Partial<Record<GameSoundName, Promise<void>>>>({});
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

  const unlockSounds = useCallback(() => {
    if (isUnlockedRef.current) return;

    try {
      void Howler.ctx?.resume?.();
      playSilentBuffer();
    } catch {
      // Some browsers do not expose/resume AudioContext.
    }

    const sound = ensureSound("move-self");
    const id = sound.play();

    sound.volume(0, id);

    window.setTimeout(() => {
      sound.stop(id);
      sound.volume(SOUND_VOLUME["move-self"]);
      isUnlockedRef.current = true;
    }, 40);
  }, [ensureSound]);

  const prepareSound = useCallback(
    (name: GameSoundName) => {
      unlockSounds();

      const sound = ensureSound(name);

      if (sound.state() === "loaded") {
        return Promise.resolve();
      }

      const existingPromise = loadPromisesRef.current[name];
      if (existingPromise) return existingPromise;

      const promise = new Promise<void>((resolve) => {
        const finish = () => {
          sound.off("load", finish);
          sound.off("loaderror", finish);
          loadPromisesRef.current[name] = undefined;
          resolve();
        };

        sound.once("load", finish);
        sound.once("loaderror", finish);
        sound.load();
      });

      loadPromisesRef.current[name] = promise;
      return promise;
    },
    [ensureSound, unlockSounds]
  );

  const prepareSounds = useCallback(
    async (names: GameSoundName[]) => {
      await Promise.all(names.map(prepareSound));
    },
    [prepareSound]
  );

  useEffect(() => {
    preloadSounds(CORE_PRELOAD_SOUNDS);

    return () => {
      Object.values(soundsRef.current).forEach((sound) => {
        sound?.unload();
      });

      soundsRef.current = {};
      loadPromisesRef.current = {};
      isUnlockedRef.current = false;
    };
  }, [preloadSounds]);

  const playSound = useCallback(
    (name: GameSoundName) => {
      const sound = ensureSound(name);

      if (sound.state() !== "loaded") {
        sound.once("load", () => {
          const loadedId = sound.play();
          sound.volume(SOUND_VOLUME[name], loadedId);
        });
        sound.load();
        return;
      }

      const id = sound.play();
      const handlePlayError = (soundId: number) => {
        if (soundId !== id) return;

        void Howler.ctx?.resume?.();
        const retryId = sound.play();
        sound.volume(SOUND_VOLUME[name], retryId);
      };
      const handlePlay = (soundId: number) => {
        if (soundId !== id) return;
        sound.off("playerror", handlePlayError, id);
      };

      sound.once("playerror", handlePlayError, id);
      sound.once("play", handlePlay, id);
      sound.volume(SOUND_VOLUME[name], id);
    },
    [ensureSound]
  );

  useEffect(() => {
    if (isUnlockedRef.current) return;

    const handleFirstInteraction = () => {
      unlockSounds();
    };

    window.addEventListener("pointerdown", handleFirstInteraction, {
      capture: true,
      passive: true,
    });
    window.addEventListener("touchend", handleFirstInteraction, {
      capture: true,
      passive: true,
    });
    window.addEventListener("keydown", handleFirstInteraction, {
      capture: true,
    });

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction, true);
      window.removeEventListener("touchend", handleFirstInteraction, true);
      window.removeEventListener("keydown", handleFirstInteraction, true);
    };
  }, [unlockSounds]);

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
      prepareSound,
      prepareSounds,
      unlockSounds,
    }),
    [
      playSound,
      playSounds,
      preloadSound,
      preloadSounds,
      prepareSound,
      prepareSounds,
      unlockSounds,
    ]
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
