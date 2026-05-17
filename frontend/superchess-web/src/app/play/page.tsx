"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { createGame, getGames, joinGame } from "@/lib/api/games";
import { getGameSession, saveGameSession } from "@/lib/storage/gameSession";
import type { CurrentUser } from "@/features/auth/api/auth";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useGameRealtime } from "@/features/game/hooks/useGameRealtime";
import { useGameSounds } from "@/features/game/sounds/GameSoundProvider";
import { JOIN_PRELOAD_SOUNDS } from "@/features/game/sounds/gameSounds";

import type { GameResponse } from "@/types/game";
import type { SubmitEvent } from "react";

import { LobbyPanel } from "@/features/game/components/lobby/LobbyPanel";
import { LobbyShell } from "@/features/game/components/lobby/LobbyShell";

type PendingAuthAction =
  | { type: "create" }
  | { type: "join"; gameId: string }
  | { type: "open"; gameId: string };

export default function PlayPage() {
  const router = useRouter();
  const { user, accessToken, isReady, isAuthenticated } = useAuth();

  const [joinGameId, setJoinGameId] = useState("");

  const [games, setGames] = useState<GameResponse[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [pendingAuthAction, setPendingAuthAction] =
    useState<PendingAuthAction | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  async function createGameForUser(currentUser: CurrentUser, token: string | null) {
    try {
      setError(null);
      setIsCreatingGame(true);
      prepareGameAudio();

      const result = await createGame(currentUser.displayName, token ?? undefined);

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
      setIsCreatingGame(false);
    }
  }

  async function handleCreateGame() {
    if (!isReady) return;

    if (!isAuthenticated || !user) {
      setError(null);
      setPendingAuthAction({ type: "create" });
      setIsAuthModalOpen(true);
      return;
    }

    await createGameForUser(user, accessToken);
  }

  async function joinExistingGameForUser(
    gameIdToJoin: string,
    currentUser: CurrentUser,
    token: string | null
  ) {
    try {
      setError(null);
      setIsJoiningGame(true);
      prepareGameAudio();

      const existingSession = getGameSession(gameIdToJoin);

      const result = await joinGame(
        gameIdToJoin,
        currentUser.displayName,
        existingSession?.sessionToken,
        token ?? undefined
      );

      saveGameSession({
        gameId: result.game.id,
        playerId: result.session.playerId,
        sessionToken: result.session.sessionToken,
        color: result.session.color,
        playerName: currentUser.displayName,
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

    if (!isAuthenticated || !user) {
      setError(null);
      setPendingAuthAction({ type: "join", gameId: gameIdToJoin });
      setIsAuthModalOpen(true);
      return;
    }

    await joinExistingGameForUser(gameIdToJoin, user, accessToken);
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

  const openRoom = useCallback(
    (gameIdToOpen: string) => {
      prepareGameAudio();
      router.push(`/game/${gameIdToOpen}`);
    },
    [prepareGameAudio, router]
  );

  const handleOpenRoom = useCallback(
    (gameIdToOpen: string) => {
      if (!isReady) return;

      if (!isAuthenticated || !user) {
        setError(null);
        setPendingAuthAction({ type: "open", gameId: gameIdToOpen });
        setIsAuthModalOpen(true);
        return;
      }

      openRoom(gameIdToOpen);
    },
    [isAuthenticated, isReady, openRoom, user]
  );

  useEffect(() => {
    if (!pendingAuthAction || !isAuthenticated || !user) {
      return;
    }

    const action = pendingAuthAction;
    setIsAuthModalOpen(false);
    setPendingAuthAction(null);

    if (action.type === "create") {
      void createGameForUser(user, accessToken);
      return;
    }

    if (action.type === "join") {
      void joinExistingGameForUser(action.gameId, user, accessToken);
      return;
    }

    openRoom(action.gameId);
  }, [
    accessToken,
    isAuthenticated,
    joinExistingGameForUser,
    createGameForUser,
    openRoom,
    pendingAuthAction,
    user,
  ]);

  return (
    <LobbyShell playerName={user?.displayName}>
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAuthAction(null);
        }}
        onAuthenticated={() => setIsAuthModalOpen(false)}
        reason="Sign in to create or join a SuperChess room."
      />
    </LobbyShell>
  );
}
