"use client";

import { useCallback, useEffect, useState } from "react";
import { getGame } from "@/lib/api/games";
import type { GameResponse } from "@/types/game";

type RefreshOptions = {
  silent?: boolean;
};

export function useGame(gameId: string | undefined) {
  const [game, setGame] = useState<GameResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (options?: RefreshOptions) => {
    if (!gameId) {
      setError("Missing game id.");
      setGame(null);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      if (!options?.silent) {
        setIsLoading(true);
      }
      const data = await getGame(gameId);
      setGame(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game.");
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        void refresh();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return { game, setGame, isLoading, error, setError, refresh };
}
