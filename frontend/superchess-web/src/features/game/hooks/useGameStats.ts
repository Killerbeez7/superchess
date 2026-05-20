"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { getGameStats } from "@/lib/api/games";
import type { GameStatsResponse } from "@/types/game";

export function useGameStats() {
  const { accessToken, isReady, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<GameStatsResponse | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isReady) return;

    if (!isAuthenticated || !accessToken) {
      setStats(null);
      setError(null);
      setIsFetching(false);
      return;
    }

    try {
      setIsFetching(true);
      setError(null);
      setStats(await getGameStats(accessToken));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats.");
    } finally {
      setIsFetching(false);
    }
  }, [accessToken, isAuthenticated, isReady]);

  useEffect(() => {
    let isAlive = true;

    if (!isReady) return;

    if (!isAuthenticated || !accessToken) {
      const timeoutId = window.setTimeout(() => {
        if (!isAlive) return;
        setStats(null);
        setError(null);
        setIsFetching(false);
      }, 0);

      return () => {
        isAlive = false;
        window.clearTimeout(timeoutId);
      };
    }

    const timeoutId = window.setTimeout(() => {
      if (!isAlive) return;
      setIsFetching(true);
      setError(null);

      void getGameStats(accessToken)
        .then((nextStats) => {
          if (isAlive) {
            setStats(nextStats);
          }
        })
        .catch((err) => {
          if (isAlive) {
            setError(err instanceof Error ? err.message : "Failed to load stats.");
          }
        })
        .finally(() => {
          if (isAlive) {
            setIsFetching(false);
          }
        });
    }, 0);

    return () => {
      isAlive = false;
      window.clearTimeout(timeoutId);
    };
  }, [accessToken, isAuthenticated, isReady]);

  return {
    stats,
    isAuthenticated,
    isLoading: !isReady || isFetching,
    error,
    refresh,
  };
}
