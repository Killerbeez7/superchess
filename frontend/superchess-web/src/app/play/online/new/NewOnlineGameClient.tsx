"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import type { AuthResponse } from "@/features/auth/api/auth";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { GameSearchingOverlay } from "@/features/game/components/GameSearchingOverlay";
import { NewGameBoardPreview } from "@/features/game/components/setup/NewGameBoardPreview";
import { NewGameSetupPanel } from "@/features/game/components/setup/NewGameSetupPanel";
import { NewOnlineGameShell } from "@/features/game/components/setup/NewOnlineGameShell";
import {
  findTimeControlFromGameSettings,
  findTimeControlFromSetupParams,
  hasTimeControlSetupParams,
  type TimeControl,
} from "@/features/game/components/setup/TimeControlPicker";
import { toCreateGameRequest } from "@/features/game/setupPreferences";
import { useGameSounds } from "@/features/game/sounds/GameSoundProvider";
import { JOIN_PRELOAD_SOUNDS } from "@/features/game/sounds/gameSounds";
import { createGame, matchmakeGame } from "@/lib/api/games";
import { markGameMatchmakingSearch, saveGameSession } from "@/lib/storage/gameSession";

type PendingCreateAction = "start" | "friend";

export function NewOnlineGameClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, accessToken, isReady, isAuthenticated, refreshUser } = useAuth();
  const { prepareSounds, playSound } = useGameSounds();

  const routeTimeControl = useMemo(
    () => findTimeControlFromSetupParams(searchParams),
    [searchParams]
  );
  const hasRouteTimeControl = useMemo(
    () => hasTimeControlSetupParams(searchParams),
    [searchParams]
  );
  const preferredTimeControl = hasRouteTimeControl
    ? routeTimeControl
    : findTimeControlFromGameSettings(user?.lastGameSettings);

  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControl | null>(
    null
  );
  const currentTimeControl = selectedTimeControl ?? preferredTimeControl;
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingCreateAction | null>(null);
  const [activeCreateAction, setActiveCreateAction] =
    useState<PendingCreateAction | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const prepareGameAudio = useCallback(() => {
    void prepareSounds(JOIN_PRELOAD_SOUNDS);
  }, [prepareSounds]);

  const createRoomForSession = useCallback(
    async (session: AuthResponse, action: PendingCreateAction) => {
      try {
        setError(null);
        setIsCreating(true);
        setActiveCreateAction(action);
        prepareGameAudio();

        const request = {
          ...toCreateGameRequest(session.user.lastGameSettings),
          initialMinutes: currentTimeControl.minutes,
          incrementSeconds: currentTimeControl.incrementSeconds,
          gameMode: "classical",
        };

        const result =
          action === "start"
            ? await matchmakeGame(session.accessToken, request)
            : await createGame(session.accessToken, request);

        await refreshUser();

        saveGameSession({
          gameId: result.game.id,
          playerId: result.playerId,
          color: result.color,
          playerName: session.user.displayName,
        });

        if (result.game.status === "active") {
          playSound("game-start");
        } else if (action === "start" && result.game.status === "waiting") {
          markGameMatchmakingSearch(result.game.id);
        }

        router.push(`/game/${result.game.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create game.");
      } finally {
        setActiveCreateAction(null);
        setIsCreating(false);
      }
    },
    [currentTimeControl, playSound, prepareGameAudio, refreshUser, router]
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

      await createRoomForSession({ accessToken, user }, action);
    },
    [accessToken, createRoomForSession, isAuthenticated, isReady, user]
  );

  const handleAuthenticated = useCallback(
    (session: AuthResponse) => {
      const action = pendingAction;

      setIsAuthModalOpen(false);
      setPendingAction(null);

      if (action) {
        void createRoomForSession(session, action);
      }
    },
    [createRoomForSession, pendingAction]
  );

  return (
    <NewOnlineGameShell
      board={
        <NewGameBoardPreview
          playerName={user?.displayName}
          timeControl={currentTimeControl}
          boardOverlay={
            <GameSearchingOverlay
              isOpen={activeCreateAction === "start"}
              title="Finding opponent"
              subtitle={`${currentTimeControl.label} · Classical · Casual`}
            />
          }
        />
      }
      panel={
        <NewGameSetupPanel
          playerName={user?.displayName}
          isIdentityReady={isReady}
          selectedTimeControl={currentTimeControl}
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
