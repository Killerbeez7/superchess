"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import type { AuthResponse } from "@/features/auth/api/auth";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { NewGameBoardPreview } from "@/features/game/components/setup/NewGameBoardPreview";
import { NewGameSetupPanel } from "@/features/game/components/setup/NewGameSetupPanel";
import { NewOnlineGameShell } from "@/features/game/components/setup/NewOnlineGameShell";
import {
  findTimeControlFromSetupParams,
  type TimeControl,
} from "@/features/game/components/setup/TimeControlPicker";
import { useGameSounds } from "@/features/game/sounds/GameSoundProvider";
import { JOIN_PRELOAD_SOUNDS } from "@/features/game/sounds/gameSounds";
import { createGame } from "@/lib/api/games";
import { saveGameSession } from "@/lib/storage/gameSession";

type PendingCreateAction = "start" | "friend";

export function NewOnlineGameClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, accessToken, isReady, isAuthenticated } = useAuth();
  const { prepareSounds } = useGameSounds();

  const routeTimeControl = useMemo(
    () => findTimeControlFromSetupParams(searchParams),
    [searchParams]
  );

  const [selectedTimeControl, setSelectedTimeControl] =
    useState<TimeControl>(routeTimeControl);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingCreateAction | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const prepareGameAudio = useCallback(() => {
    void prepareSounds(JOIN_PRELOAD_SOUNDS);
  }, [prepareSounds]);

  const createRoomForSession = useCallback(
    async (session: AuthResponse) => {
      try {
        setError(null);
        setIsCreating(true);
        prepareGameAudio();

        const result = await createGame(session.accessToken);

        saveGameSession({
          gameId: result.game.id,
          playerId: result.session.playerId,
          sessionToken: result.session.sessionToken,
          color: result.session.color,
          playerName: session.user.displayName,
        });

        router.push(`/game/${result.game.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create game.");
      } finally {
        setIsCreating(false);
      }
    },
    [prepareGameAudio, router]
  );

  const beginCreateFlow = useCallback(
    async (action: PendingCreateAction) => {
      if (!isReady) return;

      if (!isAuthenticated || !user || !accessToken) {
        setError(null);
        setPendingAction(action);
        setIsAuthModalOpen(true);
        return;
      }

      await createRoomForSession({ accessToken, user });
    },
    [accessToken, createRoomForSession, isAuthenticated, isReady, user]
  );

  const handleAuthenticated = useCallback(
    (session: AuthResponse) => {
      const action = pendingAction;

      setIsAuthModalOpen(false);
      setPendingAction(null);

      if (action) {
        void createRoomForSession(session);
      }
    },
    [createRoomForSession, pendingAction]
  );

  return (
    <NewOnlineGameShell
      board={
        <NewGameBoardPreview
          playerName={user?.displayName}
          timeControl={selectedTimeControl}
        />
      }
      panel={
        <NewGameSetupPanel
          playerName={user?.displayName}
          isIdentityReady={isReady}
          selectedTimeControl={selectedTimeControl}
          isCreating={isCreating}
          error={error}
          onTimeControlChange={setSelectedTimeControl}
          onStartGame={() => beginCreateFlow("start")}
          onCreateInviteRoom={() => beginCreateFlow("friend")}
        />
      }
      overlays={
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            setPendingAction(null);
          }}
          onAuthenticated={handleAuthenticated}
          reason="Sign in to create a SuperChess room."
        />
      }
    />
  );
}
