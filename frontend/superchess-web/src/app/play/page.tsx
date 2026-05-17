"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { createGame, getGames, joinGame } from "@/lib/api/games";
import { getGameSession, saveGameSession } from "@/lib/storage/gameSession";
import { useGameRealtime } from "@/features/game/hooks/useGameRealtime";
import { useGameSounds } from "@/features/game/sounds/GameSoundProvider";
import { usePlayerIdentity } from "@/features/game/hooks/usePlayerIdentity";
import { JOIN_PRELOAD_SOUNDS } from "@/features/game/sounds/gameSounds";

import type { GameResponse } from "@/types/game";
import type { SubmitEvent } from "react";

import { LobbyPanel } from "@/features/game/components/lobby/LobbyPanel";
import { LobbyShell } from "@/features/game/components/lobby/LobbyShell";

type PendingIdentityAction = { type: "create" } | { type: "join"; gameId: string };

type PlayerNamePromptProps = {
  error: string | null;
  isBusy: boolean;
  onClose: () => void;
  onSave: (displayName: string) => void;
};

function PlayerNamePrompt({ error, isBusy, onClose, onSave }: PlayerNamePromptProps) {
  const [displayName, setDisplayName] = useState("");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = displayName.trim();
    if (!trimmed) return;

    onSave(trimmed);
  }

  return (
    <div className="fixed inset-0 z-80 grid place-items-center bg-black/55 p-4">
      <section className="w-full max-w-sm rounded-2xl border border-app-border bg-panel p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              Player
            </p>
            <h2 className="mt-1 text-lg font-bold text-text-primary">Enter your name</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-app-border px-2 py-1 text-xs font-semibold text-text-muted transition hover:bg-white/6 hover:text-text-primary"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Player name"
            autoFocus
            className="h-10 w-full rounded-lg border border-app-border bg-sidebar px-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary-green"
          />

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="h-9 w-full rounded-md bg-primary-green px-4 text-xs font-bold text-panel shadow-sm transition hover:bg-primary-green-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Saving..." : "Continue"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default function PlayPage() {
  const router = useRouter();

  const [joinGameId, setJoinGameId] = useState("");

  const [games, setGames] = useState<GameResponse[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [identityPromptError, setIdentityPromptError] = useState<string | null>(null);
  const [pendingIdentityAction, setPendingIdentityAction] =
    useState<PendingIdentityAction | null>(null);
  const { identity, isReady, setDisplayName } = usePlayerIdentity();
  const { isConnected: isRealtimeConnected } = useGameRealtime({
    onOpenGamesChanged: setGames,
  });
  const { prepareSounds, playSound } = useGameSounds();

  const prepareGameAudio = useCallback(() => {
    void prepareSounds(JOIN_PRELOAD_SOUNDS);
  }, [prepareSounds]);

  const waitingGames = useMemo(
    () => games.filter((game) => game.status === "waiting"),
    [games]
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchInitialGames() {
      try {
        setError(null);
        const data = await getGames();

        if (!cancelled) {
          setGames(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load games.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingGames(false);
        }
      }
    }

    void fetchInitialGames();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRefreshGames() {
    try {
      setError(null);
      setIsLoadingGames(true);

      const data = await getGames();
      setGames(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load games.");
    } finally {
      setIsLoadingGames(false);
    }
  }

  async function createGameWithName(playerName: string) {
    try {
      setError(null);
      setIsCreatingGame(true);
      prepareGameAudio();

      const result = await createGame(playerName);

      saveGameSession({
        gameId: result.game.id,
        playerId: result.session.playerId,
        sessionToken: result.session.sessionToken,
        color: result.session.color,
        playerName,
      });

      router.push(`/game/${result.game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game.");
    } finally {
      setIsCreatingGame(false);
    }
  }

  async function handleCreateGame() {
    if (!isReady) return;

    if (!identity) {
      setIdentityPromptError(null);
      setPendingIdentityAction({ type: "create" });
      return;
    }

    await createGameWithName(identity.displayName);
  }

  async function joinExistingGameWithName(gameIdToJoin: string, playerName: string) {
    try {
      setError(null);
      setIsJoiningGame(true);
      prepareGameAudio();

      const existingSession = getGameSession(gameIdToJoin);

      const result = await joinGame(
        gameIdToJoin,
        playerName,
        existingSession?.sessionToken
      );

      saveGameSession({
        gameId: result.game.id,
        playerId: result.session.playerId,
        sessionToken: result.session.sessionToken,
        color: result.session.color,
        playerName,
      });

      setJoinGameId("");

      if (result.game.status === "active") {
        playSound("game-start");
      }

      router.push(`/game/${result.game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join game.");
    } finally {
      setIsJoiningGame(false);
    }
  }

  async function joinExistingGame(gameIdToJoin: string) {
    if (!isReady) return;

    if (!identity) {
      setIdentityPromptError(null);
      setPendingIdentityAction({ type: "join", gameId: gameIdToJoin });
      return;
    }

    await joinExistingGameWithName(gameIdToJoin, identity.displayName);
  }

  function handleSaveIdentity(displayName: string) {
    const action = pendingIdentityAction;

    try {
      setError(null);
      setIdentityPromptError(null);
      setDisplayName(displayName);
      setPendingIdentityAction(null);

      if (action?.type === "create") {
        void createGameWithName(displayName);
      }

      if (action?.type === "join") {
        void joinExistingGameWithName(action.gameId, displayName);
      }
    } catch (err) {
      setIdentityPromptError(
        err instanceof Error ? err.message : "Failed to save player name."
      );
    }
  }

  async function handleJoinGame(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedGameId = joinGameId.trim();

    if (!trimmedGameId) {
      setError("Game id is required.");
      return;
    }

    await joinExistingGame(trimmedGameId);
  }

  const handleOpenRoom = useCallback(
    (gameIdToOpen: string) => {
      prepareGameAudio();
      router.push(`/game/${gameIdToOpen}`);
    },
    [prepareGameAudio, router]
  );

  return (
    <LobbyShell playerName={identity?.displayName}>
      <LobbyPanel
        isIdentityReady={isReady}
        joinGameId={joinGameId}
        waitingGames={waitingGames}
        isLoadingGames={isLoadingGames}
        isCreatingGame={isCreatingGame}
        isJoiningGame={isJoiningGame}
        isRealtimeConnected={isRealtimeConnected}
        error={error}
        onCreateGame={handleCreateGame}
        onJoinGame={handleJoinGame}
        onJoinGameIdChange={setJoinGameId}
        onJoinExistingGame={(gameId) => {
          void joinExistingGame(gameId);
        }}
        onOpenRoom={(gameId) => {
          void handleOpenRoom(gameId);
        }}
        onRefreshGames={handleRefreshGames}
      />

      {pendingIdentityAction && (
        <PlayerNamePrompt
          error={identityPromptError}
          isBusy={isCreatingGame || isJoiningGame}
          onClose={() => {
            setIdentityPromptError(null);
            setPendingIdentityAction(null);
          }}
          onSave={handleSaveIdentity}
        />
      )}
    </LobbyShell>
  );
}
