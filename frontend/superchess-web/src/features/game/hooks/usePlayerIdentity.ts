"use client";

import { useEffect, useState } from "react";

import type { PlayerIdentity } from "@/types/player";
import {
  createLocalPlayerIdentity,
  getPlayerIdentity,
  savePlayerIdentity,
  clearPlayerIdentity,
  PLAYER_IDENTITY_CHANGED_EVENT,
} from "@/lib/storage/playerIdentity";

export function usePlayerIdentity() {
  const [identity, setIdentityState] = useState<PlayerIdentity | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isAlive = true;

    const syncIdentity = () => {
      if (!isAlive) return;

      const identity = getPlayerIdentity();
      setIdentityState(identity);
      setIsReady(true);
    };

    const initId = window.setTimeout(syncIdentity, 0);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "superchess.playerIdentity") {
        syncIdentity();
      }
    };

    window.addEventListener(PLAYER_IDENTITY_CHANGED_EVENT, syncIdentity);
    window.addEventListener("storage", handleStorage);

    return () => {
      isAlive = false;
      window.clearTimeout(initId);
      window.removeEventListener(PLAYER_IDENTITY_CHANGED_EVENT, syncIdentity);
      window.removeEventListener("storage", handleStorage);
    };
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
