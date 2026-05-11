"use client";

import { useEffect, useState } from "react";

import type { PlayerIdentity } from "@/types/player";
import {
  createLocalPlayerIdentity,
  getPlayerIdentity,
  savePlayerIdentity,
  clearPlayerIdentity,
} from "@/lib/storage/playerIdentity";

export function usePlayerIdentity() {
  const [identity, setIdentityState] = useState<PlayerIdentity | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initPlayer = async () => {
      const identity = await getPlayerIdentity();
      setIdentityState(identity);
      setIsReady(true);
    };

    initPlayer();
  }, []);

  function setDisplayName(displayName: string) {
    const trimmed = displayName.trim();

    if (!trimmed) {
      throw new Error("Display name is required.");
    }

    const existing = getPlayerIdentity();

    const nextIdentity: PlayerIdentity = existing
      ? {
          ...existing,
          displayName: trimmed,
        }
      : createLocalPlayerIdentity(trimmed);

    savePlayerIdentity(nextIdentity);
    setIdentityState(nextIdentity);
  }

  function clearIdentity() {
    clearPlayerIdentity();
    setIdentityState(null);
  }

  return {
    identity,
    isReady,
    hasIdentity: !!identity,
    setDisplayName,
    clearIdentity,
  };
}
