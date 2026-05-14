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

function createAudio() {
  const audio = new Audio(AUDIO_FILE_PATH);
  audio.preload = "auto";
  audio.load();

  return audio;
}

export function useGameSounds() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const isUnlockedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = createAudio();
    audioRef.current = audio;

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      audio.pause();
      audioRef.current = null;
      isUnlockedRef.current = false;
    };
  }, []);

  const getAudio = useCallback(() => {
    if (typeof window === "undefined") return null;

    if (!audioRef.current) {
      audioRef.current = createAudio();
    }

    return audioRef.current;
  }, []);

  const unlockSound = useCallback(async () => {
    if (isUnlockedRef.current) return;

    const audio = getAudio();
    if (!audio) return;

    const previousMuted = audio.muted;
    const previousVolume = audio.volume;

    try {
      audio.muted = true;
      audio.volume = 0;
      audio.currentTime = 0;

      await audio.play();
      audio.pause();
      audio.currentTime = 0;

      isUnlockedRef.current = true;
    } catch (error) {
      console.warn("Failed to unlock game audio.", error);
    } finally {
      audio.muted = previousMuted;
      audio.volume = previousVolume;
    }
  }, [getAudio]);

  const playSound = useCallback((name: GameSoundName) => {
    const audio = getAudio();
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

    void audio
      .play()
      .then(() => {
        isUnlockedRef.current = true;

        timeoutRef.current = window.setTimeout(() => {
          audio.pause();
          timeoutRef.current = null;
        }, sprite.duration * 1000);
      })
      .catch((error) => {
        console.warn("Failed to play game sound.", error);
      });
  }, [getAudio]);

  return { playSound, unlockSound };
}
