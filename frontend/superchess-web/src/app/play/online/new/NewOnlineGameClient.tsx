"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import type { CurrentUser } from "@/features/auth/api/auth";
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
  const { user, isReady, isAuthenticated } = useAuth();
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

  const createRoomForUser = useCallback(
    async (currentUser: CurrentUser) => {
      try {
        setError(null);
        setIsCreating(true);
        prepareGameAudio();

        const result = await createGame(currentUser.displayName);

        saveGameSession({
          gameId: result.game.id,
          playerId: result.session.playerId,
          sessionToken: result.session.sessionToken,
          color: result.session.color,
          playerName: currentUser.displayName,
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

      if (!isAuthenticated || !user) {
        setError(null);
        setPendingAction(action);
        setIsAuthModalOpen(true);
        return;
      }

      await createRoomForUser(user);
    },
    [createRoomForUser, isAuthenticated, isReady, user]
  );

  const handleAuthenticated = useCallback(
    (currentUser: CurrentUser) => {
      const action = pendingAction;

      setIsAuthModalOpen(false);
      setPendingAction(null);

      if (action) {
        void createRoomForUser(currentUser);
      }
    },
    [createRoomForUser, pendingAction]
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
