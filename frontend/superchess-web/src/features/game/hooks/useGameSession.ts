"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getGameSession,
  saveGameSession,
  type StoredGameSession,
} from "@/lib/storage/gameSession";

export function useGameSession(gameId: string | undefined) {
  const [session, setSession] = useState<StoredGameSession | null>(null);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setSession(gameId ? getGameSession(gameId) : null);
    });
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  const persist = useCallback((next: StoredGameSession) => {
    saveGameSession(next);
    setSession(next);
  }, []);

  return { session, saveSession: persist };
}
