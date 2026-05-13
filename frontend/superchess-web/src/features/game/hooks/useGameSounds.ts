"use client";

import { useCallback, useEffect, useRef } from "react";

type GameSoundName = "move" | "capture" | "check" | "game_over";

type SoundSprite = {
  start: number;
  duration: number;
};

const AUDIO_FILE_PATH = "/sounds/move.mp3";

const SOUND_SPRITES: Record<GameSoundName, SoundSprite> = {
  move: { start: 0.75, duration: 0.5 },
  capture: { start: 10.86, duration: 0.42 },
  check: { start: 20.45, duration: 0.88 },
  game_over: { start: 20.45, duration: 0.88 },
};

export function useGameSounds() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio(AUDIO_FILE_PATH);
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const playSound = useCallback((name: GameSoundName) => {
    const audio = audioRef.current;
    if (!audio) return;

    const sprite = SOUND_SPRITES[name];

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    audio.pause();

    try {
      audio.currentTime = sprite.start;
    } catch {
      return;
    }

    void audio.play().catch(() => {});

    timeoutRef.current = window.setTimeout(() => {
      audio.pause();
      timeoutRef.current = null;
    }, sprite.duration * 1000);
  }, []);

  return { playSound };
}
