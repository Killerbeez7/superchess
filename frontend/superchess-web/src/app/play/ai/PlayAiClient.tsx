"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import type { AuthResponse } from "@/features/auth/api/auth";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  BotGameOptions,
  type BotLevel,
} from "@/features/game/components/setup/BotGameOptions";
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
import { createAiGame } from "@/lib/api/games";
import { saveGameSession } from "@/lib/storage/gameSession";
import type { PieceColor } from "@/types/game";

export function PlayAiClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, accessToken, isReady, isAuthenticated, refreshUser } = useAuth();
  const { prepareSounds } = useGameSounds();

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
  const [playerColor, setPlayerColor] = useState<PieceColor>("white");
  const [botLevel, setBotLevel] = useState<BotLevel>(3);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldStartAfterAuth, setShouldStartAfterAuth] = useState(false);
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

        const result = await createAiGame(session.accessToken, {
          ...toCreateGameRequest(session.user.lastGameSettings),
          initialMinutes: currentTimeControl.minutes,
          incrementSeconds: currentTimeControl.incrementSeconds,
          gameMode: "classical",
          botLevel,
          playerColor,
        });

        await refreshUser();

        saveGameSession({
          gameId: result.game.id,
          playerId: result.playerId,
          color: result.color,
          playerName: session.user.displayName,
        });

        router.push(`/game/${result.game.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create game.");
      } finally {
        setIsCreating(false);
      }
    },
    [botLevel, currentTimeControl, playerColor, prepareGameAudio, refreshUser, router]
  );

  const beginCreateFlow = useCallback(
    async () => {
      if (!isReady) return;

      if (!isAuthenticated || !user || !accessToken) {
        setError(null);
        setShouldStartAfterAuth(true);
        setIsAuthModalOpen(true);
        return;
      }

      await createRoomForSession({ accessToken, user });
    },
    [accessToken, createRoomForSession, isAuthenticated, isReady, user]
  );

  const handleAuthenticated = useCallback(
    (session: AuthResponse) => {
      const shouldStart = shouldStartAfterAuth;

      setIsAuthModalOpen(false);
      setShouldStartAfterAuth(false);

      if (shouldStart) {
        void createRoomForSession(session);
      }
    },
    [createRoomForSession, shouldStartAfterAuth]
  );

  return (
    <NewOnlineGameShell
      board={
        <NewGameBoardPreview
          playerName={user?.displayName}
          timeControl={currentTimeControl}
          playerColor={playerColor}
          opponentName={`SuperChess Bot L${botLevel}`}
        />
      }
      panel={
        <NewGameSetupPanel
          title="Play AI"
          playerName={user?.displayName}
          isIdentityReady={isReady}
          selectedTimeControl={currentTimeControl}
          isCreating={isCreating}
          error={error}
          onTimeControlChange={setSelectedTimeControl}
          onStartGame={beginCreateFlow}
          onCreateInviteRoom={beginCreateFlow}
          primaryActionLabel="Start vs AI"
          creatingLabel="Starting..."
          showSecondaryAction={false}
        >
          <BotGameOptions
            playerColor={playerColor}
            botLevel={botLevel}
            onPlayerColorChange={setPlayerColor}
            onBotLevelChange={setBotLevel}
          />
        </NewGameSetupPanel>
      }
      overlays={
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            setShouldStartAfterAuth(false);
          }}
          onAuthenticated={handleAuthenticated}
          reason="Sign in to play against SuperChess AI."
        />
      }
    />
  );
}
