"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { createGame } from "@/lib/api/games";
import { saveGameSession } from "@/lib/storage/gameSession";
import { PlayerIdentitySetup } from "@/features/game/components/PlayerIdentitySetup";
import { NewGameBoardPreview } from "@/features/game/components/setup/NewGameBoardPreview";
import { NewGameSetupPanel } from "@/features/game/components/setup/NewGameSetupPanel";
import { NewOnlineGameShell } from "@/features/game/components/setup/NewOnlineGameShell";
import {
  DEFAULT_TIME_CONTROL,
  type TimeControl,
} from "@/features/game/components/setup/TimeControlPicker";
import { usePlayerIdentity } from "@/features/game/hooks/usePlayerIdentity";
import { useGameSounds } from "@/features/game/sounds/GameSoundProvider";
import { JOIN_PRELOAD_SOUNDS } from "@/features/game/sounds/gameSounds";

type PendingCreateAction = "start" | "friend";

export default function NewOnlineGamePage() {
  const router = useRouter();
  const { identity, isReady, setDisplayName } = usePlayerIdentity();
  const { prepareSounds } = useGameSounds();

  const [selectedTimeControl, setSelectedTimeControl] =
    useState<TimeControl>(DEFAULT_TIME_CONTROL);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingCreateAction | null>(null);

  const prepareGameAudio = useCallback(() => {
    void prepareSounds(JOIN_PRELOAD_SOUNDS);
  }, [prepareSounds]);

  const createRoomWithName = useCallback(
    async (playerName: string) => {
      try {
        setError(null);
        setIsCreating(true);
        prepareGameAudio();

        const result = await createGame(playerName);

        saveGameSession({
          gameId: result.game.id,
          playerId: result.session.playerId,
          sessionToken: result.session.sessionToken,
          color: result.session.color,
          playerName,
        });

        router.push(`/play/${result.game.id}`);
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

      if (!identity) {
        setError(null);
        setPendingAction(action);
        return;
      }

      await createRoomWithName(identity.displayName);
    },
    [createRoomWithName, identity, isReady]
  );

  function handleSaveIdentity(displayName: string) {
    try {
      setDisplayName(displayName);
      setPendingAction(null);
      void createRoomWithName(displayName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save player name.");
    }
  }

  return (
    <NewOnlineGameShell
      board={
        <NewGameBoardPreview
          playerName={identity?.displayName}
          timeControl={selectedTimeControl}
        />
      }
      panel={
        <NewGameSetupPanel
          playerName={identity?.displayName}
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
        pendingAction ? (
          <PlayerIdentitySetup isSaving={isCreating} onSave={handleSaveIdentity} />
        ) : null
      }
    />
  );
}
