"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { FaBolt, FaChessKnight, FaRobot, FaUserGroup } from "react-icons/fa6";

import type { AuthResponse } from "@/features/auth/api/auth";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { FRIEND_ONLINE_SETUP_HREF, ONLINE_SETUP_HREF } from "@/features/game/setupRoutes";
import { toCreateGameRequest } from "@/features/game/setupPreferences";
import { useGameSounds } from "@/features/game/sounds/GameSoundProvider";
import { JOIN_PRELOAD_SOUNDS } from "@/features/game/sounds/gameSounds";
import { createGame } from "@/lib/api/games";
import { saveGameSession } from "@/lib/storage/gameSession";

import { HomeActionCard } from "./HomeActionCard";

export function HomeActionGrid() {
  const router = useRouter();
  const { user, accessToken, isReady, isAuthenticated } = useAuth();
  const { prepareSounds } = useGameSounds();
  const [isCreatingQuickGame, setIsCreatingQuickGame] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prepareGameAudio = useCallback(() => {
    void prepareSounds(JOIN_PRELOAD_SOUNDS);
  }, [prepareSounds]);

  const startQuickGameForSession = useCallback(
    async (session: AuthResponse) => {
      try {
        setError(null);
        setIsCreatingQuickGame(true);
        prepareGameAudio();

        const result = await createGame(
          session.accessToken,
          toCreateGameRequest(session.user.lastGameSettings)
        );

        saveGameSession({
          gameId: result.game.id,
          playerId: result.playerId,
          color: result.color,
          playerName: session.user.displayName,
        });

        router.push(`/game/${result.game.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start quick game.");
      } finally {
        setIsCreatingQuickGame(false);
      }
    },
    [prepareGameAudio, router]
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
          description="Start with your last setup."
          onClick={handleQuickPlay}
          icon={<FaBolt />}
          featured
          isBusy={isCreatingQuickGame}
        />
        <HomeActionCard
          title="New Game"
          description="Create or join a room."
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
          title="Play Bot"
          description="Coming soon."
          icon={<FaRobot />}
          disabled
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
