"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { FaBolt, FaChessKnight, FaRobot, FaUserGroup } from "react-icons/fa6";

import type { AuthResponse } from "@/features/auth/api/auth";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  FRIEND_ONLINE_SETUP_HREF,
  ONLINE_SETUP_HREF,
  PLAY_AI_SETUP_HREF,
} from "@/features/game/setupRoutes";
import {
  DEFAULT_GAME_SETTINGS,
  formatGameSetupSummary,
  toCreateGameRequest,
} from "@/features/game/setupPreferences";
import { useGameSounds } from "@/features/game/sounds/GameSoundProvider";
import { JOIN_PRELOAD_SOUNDS } from "@/features/game/sounds/gameSounds";
import { matchmakeGame } from "@/lib/api/games";
import { saveGameSession } from "@/lib/storage/gameSession";

import { HomeActionCard } from "./HomeActionCard";

export function HomeActionGrid() {
  const router = useRouter();
  const { user, accessToken, isReady, isAuthenticated } = useAuth();
  const { prepareSounds, playSound } = useGameSounds();
  const [isCreatingQuickGame, setIsCreatingQuickGame] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const quickPlaySettings = user?.lastGameSettings ?? DEFAULT_GAME_SETTINGS;
  const quickPlayDescription = formatGameSetupSummary(quickPlaySettings);

  const prepareGameAudio = useCallback(() => {
    void prepareSounds(JOIN_PRELOAD_SOUNDS);
  }, [prepareSounds]);

  const startQuickGameForSession = useCallback(
    async (session: AuthResponse) => {
      try {
        setError(null);
        setIsCreatingQuickGame(true);
        prepareGameAudio();

        const result = await matchmakeGame(
          session.accessToken,
          toCreateGameRequest(session.user.lastGameSettings)
        );

        saveGameSession({
          gameId: result.game.id,
          playerId: result.playerId,
          color: result.color,
          playerName: session.user.displayName,
        });

        if (result.game.status === "active") {
          playSound("game-start");
        }

        router.push(`/game/${result.game.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start quick game.");
      } finally {
        setIsCreatingQuickGame(false);
      }
    },
    [playSound, prepareGameAudio, router]
  );

  const handleQuickPlay = useCallback(() => {
    if (!isReady || isCreatingQuickGame) return;

    if (!isAuthenticated || !user || !accessToken) {
      setError(null);
      setIsAuthModalOpen(true);
      return;
    }

    void startQuickGameForSession({ accessToken, user });
  }, [
    accessToken,
    isAuthenticated,
    isCreatingQuickGame,
    isReady,
    startQuickGameForSession,
    user,
  ]);

  const handleAuthenticated = useCallback(
    (session: AuthResponse) => {
      setIsAuthModalOpen(false);
      void startQuickGameForSession(session);
    },
    [startQuickGameForSession]
  );

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2">
        <HomeActionCard
          title={isCreatingQuickGame ? "Starting..." : "Quick Play"}
          description={quickPlayDescription}
          onClick={handleQuickPlay}
          icon={<FaBolt />}
          featured
          isBusy={isCreatingQuickGame}
        />
        <HomeActionCard
          title="New Game"
          description="Choose time and mode."
          href={ONLINE_SETUP_HREF}
          icon={<FaChessKnight />}
        />
        <HomeActionCard
          title="Play Friend"
          description="Start a private room link."
          href={FRIEND_ONLINE_SETUP_HREF}
          icon={<FaUserGroup />}
        />
        <HomeActionCard
          title="Play AI"
          description="Practice against the engine."
          href={PLAY_AI_SETUP_HREF}
          icon={<FaRobot />}
        />
      </section>

      {error ? (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={handleAuthenticated}
        reason="Sign in to start a quick SuperChess game."
      />
    </>
  );
}
