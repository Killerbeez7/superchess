"use client";

import { useCallback, useEffect, useRef } from "react";

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

const SOUND_PATHS: Record<GameSoundName, string> = {
  "game-start": "/sounds/game-start.mp3",
  "game-end": "/sounds/game-end.mp3",
  capture: "/sounds/capture.mp3",
  castle: "/sounds/castle.mp3",
  premove: "/sounds/premove.mp3",
  "move-self": "/sounds/move-self.mp3",
  "move-opponent": "/sounds/move-opponent.mp3",
  "move-check": "/sounds/move-check.mp3",
  promote: "/sounds/promote.mp3",
  notify: "/sounds/notify.mp3",
  illegal: "/sounds/illegal.mp3",
  tenseconds: "/sounds/tenseconds.mp3",
};

const AUDIO_POOL_SIZE = 3;

export function useGameSounds() {
  const poolsRef = useRef<Partial<Record<GameSoundName, HTMLAudioElement[]>>>({});
  const indexesRef = useRef<Partial<Record<GameSoundName, number>>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pools: Partial<Record<GameSoundName, HTMLAudioElement[]>> = {};

    (Object.keys(SOUND_PATHS) as GameSoundName[]).forEach((name) => {
      pools[name] = Array.from({ length: AUDIO_POOL_SIZE }, () => {
        const audio = new Audio(SOUND_PATHS[name]);
        audio.preload = "auto";
        audio.load();
        return audio;
      });

      indexesRef.current[name] = 0;
    });

    poolsRef.current = pools;

    return () => {
      Object.values(poolsRef.current).forEach((pool) => {
        pool?.forEach((audio) => {
          audio.pause();
          audio.src = "";
        });
      });

      poolsRef.current = {};
      indexesRef.current = {};
    };
  }, []);

  const playSound = useCallback((name: GameSoundName) => {
    const pool = poolsRef.current[name];
    if (!pool?.length) return;

    const index = indexesRef.current[name] ?? 0;
    const audio = pool[index];

    indexesRef.current[name] = (index + 1) % pool.length;

    audio.pause();
    audio.currentTime = 0;

    void audio.play().catch(() => {
      // Browser may block sound until first user interaction.
    });
  }, []);

  const playCheckmateSound = useCallback(() => {
    playSound("move-check");

    window.setTimeout(() => {
      playSound("game-end");
    }, 140);
  }, [playSound]);

  return {
    playSound,
    playCheckmateSound,
  };
}
