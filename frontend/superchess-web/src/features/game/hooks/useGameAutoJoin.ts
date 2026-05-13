"use client";

import { useEffect, useRef } from "react";

import type { GameResponse } from "@/types/game";
import type { LocalGameSession } from "@/lib/storage/gameSession";
import type { PlayerIdentity } from "@/types/player";

type useGameAutoJoinParams = {
  gameId?: string;
  game: GameResponse | null;
  identity: PlayerIdentity | null;
  isIdentityReady: boolean;
  session: LocalGameSession | null;
  handleJoin: (displayName: string) => Promise<void>;
};

export function useGameAutoJoin({
  gameId,
  game,
  identity,
  isIdentityReady,
  session,
  handleJoin,
}: useGameAutoJoinParams) {
  const hasAttemptedAutoJoinRef = useRef(false);

  useEffect(() => {
    if (!gameId || !game || !isIdentityReady || !identity) {
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
    void handleJoin(identity.displayName);
  }, [gameId, game, identity, isIdentityReady, session, handleJoin]);
}
