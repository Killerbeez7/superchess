"use client";

import { useCallback, useEffect, useRef } from "react";

export type GameSoundName =
  | "move"
  | "move_opponent"
  | "capture"
  | "castle"
  | "check"
  | "game_end"
  | "game_start"
  | "illegal"
  | "notify"
  | "premove"
  | "promote"
  | "ten_seconds";

type AudioContextConstructor = typeof AudioContext;

type WebAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: AudioContextConstructor;
  };

const DEFAULT_VOLUME = 1;
const HTML_UNLOCK_VOLUME = 0.04;
const HTML_UNLOCK_DURATION_MS = 80;
const SILENT_UNLOCK_GAIN = 0.0001;

const SOUND_FILES: Record<GameSoundName, string> = {
  move: "/sounds/move-self.mp3",
  move_opponent: "/sounds/move-opponent.mp3",
  capture: "/sounds/capture.mp3",
  castle: "/sounds/castle.mp3",
  check: "/sounds/move-check.mp3",
  game_end: "/sounds/game-end.mp3",
  game_start: "/sounds/game-start.mp3",
  illegal: "/sounds/illegal.mp3",
  notify: "/sounds/notify.mp3",
  premove: "/sounds/premove.mp3",
  promote: "/sounds/promote.mp3",
  ten_seconds: "/sounds/tenseconds.mp3",
};
const SOUND_NAMES = Object.keys(SOUND_FILES) as GameSoundName[];

function getAudioContextConstructor() {
  if (typeof window === "undefined") return null;

  const webAudioWindow = window as WebAudioWindow;
  return webAudioWindow.AudioContext ?? webAudioWindow.webkitAudioContext ?? null;
}

function decodeAudioData(
  context: AudioContext,
  arrayBuffer: ArrayBuffer
): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    context.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
  });
}

function seekAudio(audio: HTMLAudioElement, time: number) {
  try {
    audio.currentTime = time;
  } catch {
    try {
      audio.currentTime = 0;
    } catch {
      // Safari can reject seeking while media state is changing.
    }
  }
}

export function useGameSounds() {
  const audioRefs = useRef<Partial<Record<GameSoundName, HTMLAudioElement>>>({});
  const htmlTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Partial<Record<GameSoundName, AudioBuffer>>>({});
  const bufferPromisesRef = useRef<
    Partial<Record<GameSoundName, Promise<AudioBuffer | null>>>
  >({});
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isUnlockedRef = useRef(false);

  const clearHtmlTimeout = useCallback(() => {
    if (!htmlTimeoutRef.current) return;

    clearTimeout(htmlTimeoutRef.current);
    htmlTimeoutRef.current = null;
  }, []);

  const getAudio = useCallback((name: GameSoundName) => {
    if (typeof Audio === "undefined") return null;

    if (!audioRefs.current[name]) {
      const audio = new Audio(SOUND_FILES[name]);
      audio.preload = "auto";
      audio.volume = DEFAULT_VOLUME;
      audio.setAttribute("playsinline", "true");
      audio.setAttribute("webkit-playsinline", "true");
      audio.load();
      audioRefs.current[name] = audio;
    }

    return audioRefs.current[name] ?? null;
  }, []);

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (audioContextRef.current) return audioContextRef.current;

    const AudioContextClass = getAudioContextConstructor();
    if (!AudioContextClass) return null;

    audioContextRef.current = new AudioContextClass();
    return audioContextRef.current;
  }, []);

  const loadBuffer = useCallback(
    async (name: GameSoundName) => {
      if (audioBuffersRef.current[name]) return audioBuffersRef.current[name] ?? null;
      if (bufferPromisesRef.current[name]) return bufferPromisesRef.current[name];

      const context = getAudioContext();
      if (!context) return null;

      bufferPromisesRef.current[name] = fetch(SOUND_FILES[name])
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load sound: ${response.status}`);
          }

          return response.arrayBuffer();
        })
        .then((arrayBuffer) => decodeAudioData(context, arrayBuffer))
        .then((buffer) => {
          audioBuffersRef.current[name] = buffer;
          return buffer;
        })
        .catch((err) => {
          console.warn(`Failed to prepare ${name} sound:`, err);
          delete bufferPromisesRef.current[name];
          return null;
        });

      return bufferPromisesRef.current[name] ?? null;
    },
    [getAudioContext]
  );

  const preloadBuffers = useCallback(() => {
    for (const name of SOUND_NAMES) {
      void loadBuffer(name);
    }
  }, [loadBuffer]);

  const playSilentUnlockPulse = useCallback((context: AudioContext) => {
    const source = context.createBufferSource();
    const gain = context.createGain();

    source.buffer = context.createBuffer(1, 1, context.sampleRate);
    gain.gain.value = SILENT_UNLOCK_GAIN;
    source.connect(gain);
    gain.connect(context.destination);
    source.start(0);
  }, []);

  const unlockHtmlAudio = useCallback(() => {
    const audio = getAudio("move");
    if (!audio) return;

    clearHtmlTimeout();

    audio.pause();
    audio.muted = false;
    audio.volume = HTML_UNLOCK_VOLUME;
    seekAudio(audio, 0);

    void audio
      .play()
      .then(() => {
        isUnlockedRef.current = true;

        htmlTimeoutRef.current = setTimeout(() => {
          audio.pause();
          audio.volume = DEFAULT_VOLUME;
          seekAudio(audio, 0);
        }, HTML_UNLOCK_DURATION_MS);
      })
      .catch((err) => {
        console.warn("Unable to unlock game sound:", err);
      });
  }, [clearHtmlTimeout, getAudio]);

  const unlockSound = useCallback(() => {
    if (isUnlockedRef.current) return;

    const context = getAudioContext();
    if (!context) {
      unlockHtmlAudio();
      return;
    }

    try {
      void context
        .resume()
        .then(() => {
          isUnlockedRef.current = true;
          preloadBuffers();
        })
        .catch((err) => {
          isUnlockedRef.current = false;
          console.warn("Unable to unlock Web Audio:", err);
          unlockHtmlAudio();
        });

      playSilentUnlockPulse(context);
      isUnlockedRef.current = true;
      preloadBuffers();
    } catch (err) {
      console.warn("Unable to unlock Web Audio:", err);
      unlockHtmlAudio();
    }
  }, [getAudioContext, playSilentUnlockPulse, preloadBuffers, unlockHtmlAudio]);

  const playHtmlSound = useCallback(
    (name: GameSoundName) => {
      const audio = getAudio(name);
      if (!audio) return;

      clearHtmlTimeout();
      audio.pause();
      audio.muted = false;
      audio.volume = DEFAULT_VOLUME;
      seekAudio(audio, 0);

      void audio
        .play()
        .then(() => {
          htmlTimeoutRef.current = setTimeout(() => {
            audio.pause();
            htmlTimeoutRef.current = null;
          }, Math.max(audio.duration * 1000, HTML_UNLOCK_DURATION_MS));
        })
        .catch((err) => {
          console.warn(`Unable to play ${name} sound:`, err);
        });
    },
    [clearHtmlTimeout, getAudio]
  );

  const playBufferedSound = useCallback(
    async (name: GameSoundName) => {
      try {
        const context = getAudioContext();
        if (!context) return false;

        await context.resume();

        const buffer = await loadBuffer(name);
        if (!buffer) return false;

        const source = context.createBufferSource();
        const gain = context.createGain();

        source.buffer = buffer;
        gain.gain.value = DEFAULT_VOLUME;
        source.connect(gain);
        gain.connect(context.destination);

        activeSourcesRef.current.push(source);
        source.onended = () => {
          activeSourcesRef.current = activeSourcesRef.current.filter(
            (activeSource) => activeSource !== source
          );
        };

        source.start(0);
        isUnlockedRef.current = true;

        return true;
      } catch (err) {
        console.warn(`Unable to play buffered ${name} sound:`, err);
        return false;
      }
    },
    [getAudioContext, loadBuffer]
  );

  const playSound = useCallback(
    (name: GameSoundName) => {
      void playBufferedSound(name)
        .then((playedBufferedSound) => {
          if (!playedBufferedSound) {
            playHtmlSound(name);
          }
        })
        .catch((err) => {
          console.warn(`Unable to play ${name} sound:`, err);
        });
    },
    [playBufferedSound, playHtmlSound]
  );

  useEffect(() => {
    getAudio("move");

    return () => {
      clearHtmlTimeout();

      activeSourcesRef.current.forEach((source) => {
        try {
          source.stop();
        } catch {
          // Source may have already ended.
        }
      });

      activeSourcesRef.current = [];

      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
      });
      audioRefs.current = {};

      const context = audioContextRef.current;
      if (context && context.state !== "closed") {
        void context.close();
      }

      audioContextRef.current = null;
      audioBuffersRef.current = {};
      bufferPromisesRef.current = {};
      isUnlockedRef.current = false;
    };
  }, [clearHtmlTimeout, getAudio]);

  return { playSound, unlockSound };
}
