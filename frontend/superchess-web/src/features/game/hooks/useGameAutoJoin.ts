"use client";

import { useEffect, useRef } from "react";

import type { GameResponse } from "@/types/game";
import type { LocalGameSession } from "@/lib/storage/gameSession";

type useGameAutoJoinParams = {
  gameId?: string;
  game: GameResponse | null;
  accessToken: string | null;
  isIdentityReady: boolean;
  session: LocalGameSession | null;
  handleJoin: (accessToken: string) => Promise<void>;
};

export function useGameAutoJoin({
  gameId,
  game,
  accessToken,
  isIdentityReady,
  session,
  handleJoin,
}: useGameAutoJoinParams) {
  const hasAttemptedAutoJoinRef = useRef(false);

  useEffect(() => {
    if (!gameId || !game || !isIdentityReady || !accessToken) {
      return;
    }

    if (hasAttemptedAutoJoinRef.current) {
      return;
    }

    const canAutoJoin = game.status === "waiting" && !game.blackPlayer && !session;

    if (!canAutoJoin) {
      return;
    }

    hasAttemptedAutoJoinRef.current = true;
    void handleJoin(accessToken);
  }, [gameId, game, accessToken, isIdentityReady, session, handleJoin]);
}
