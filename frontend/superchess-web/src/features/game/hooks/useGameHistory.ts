"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { getGameHistory } from "@/lib/api/games";
import type { GameHistoryResponse } from "@/types/game";

export function useGameHistory(limit?: number) {
  const { accessToken, isReady, isAuthenticated } = useAuth();
  const [games, setGames] = useState<GameHistoryResponse[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyLimit = useCallback(
    (history: GameHistoryResponse[]) =>
      typeof limit === "number" ? history.slice(0, limit) : history,
    [limit]
  );

  const refresh = useCallback(async () => {
    if (!isReady) return;

    if (!isAuthenticated || !accessToken) {
      setGames([]);
      setError(null);
      setIsFetching(false);
      return;
    }

    try {
      setIsFetching(true);
      setError(null);
      const history = await getGameHistory(accessToken);
      setGames(applyLimit(history));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load games.");
    } finally {
      setIsFetching(false);
    }
  }, [accessToken, applyLimit, isAuthenticated, isReady]);

  useEffect(() => {
    let isAlive = true;

    if (!isReady) return;

    if (!isAuthenticated || !accessToken) {
      const timeoutId = window.setTimeout(() => {
        if (!isAlive) return;
        setGames([]);
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
    }, 0);

    void getGameHistory(accessToken)
      .then((history) => {
        if (isAlive) {
          setGames(applyLimit(history));
        }
      })
      .catch((err) => {
        if (isAlive) {
          setError(err instanceof Error ? err.message : "Failed to load games.");
        }
      })
      .finally(() => {
        if (isAlive) {
          setIsFetching(false);
        }
      });

    return () => {
      isAlive = false;
      window.clearTimeout(timeoutId);
    };
  }, [accessToken, applyLimit, isAuthenticated, isReady]);

  return {
    games,
    isAuthenticated,
    isLoading: !isReady || isFetching,
    error,
    refresh,
  };
}
