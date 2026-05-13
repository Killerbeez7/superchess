"use client";

import { useEffect, useMemo, useState } from "react";
import type { GameResponse, PieceColor } from "@/types/game";

const TICK_MS = 250;
const DEFAULT_CLOCK_MS = 10 * 60 * 1000;

function getRemainingMs(game: GameResponse, color: PieceColor, now: number) {
  const clockValue =
    color === "white" ? game.whiteTimeRemainingMs : game.blackTimeRemainingMs;
  const baseRemaining =
    typeof clockValue === "number"
      ? clockValue
      : game.initialClockMs ?? DEFAULT_CLOCK_MS;

  if (
    game.status !== "active" ||
    game.whoseTurn !== color ||
    !game.turnStartedAtUtc
  ) {
    return Math.max(0, baseRemaining);
  }

  const turnStartedAt = new Date(game.turnStartedAtUtc).getTime();
  if (Number.isNaN(turnStartedAt)) {
    return Math.max(0, baseRemaining);
  }

  return Math.max(0, baseRemaining - (now - turnStartedAt));
}

function formatClock(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function useGameClocks(game: GameResponse | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (game?.status !== "active" || !game.turnStartedAtUtc) {
      return;
    }

    const timerId = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(timerId);
  }, [game?.status, game?.turnStartedAtUtc, game?.whoseTurn]);

  return useMemo(() => {
    if (!game) {
      return {
        whiteTimer: "--:--",
        blackTimer: "--:--",
        whiteTimeRemainingMs: 0,
        blackTimeRemainingMs: 0,
      };
    }

    const whiteTimeRemainingMs = getRemainingMs(game, "white", now);
    const blackTimeRemainingMs = getRemainingMs(game, "black", now);

    return {
      whiteTimer: formatClock(whiteTimeRemainingMs),
      blackTimer: formatClock(blackTimeRemainingMs),
      whiteTimeRemainingMs,
      blackTimeRemainingMs,
    };
  }, [game, now]);
}
