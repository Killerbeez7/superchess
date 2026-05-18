"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { createGame, getGames, joinGame } from "@/lib/api/games";
import { getGameSession, saveGameSession } from "@/lib/storage/gameSession";
import type { AuthResponse } from "@/features/auth/api/auth";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toCreateGameRequest } from "@/features/game/setupPreferences";
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
  const [pendingAuthAction, setPendingAuthAction] = useState<PendingAuthAction | null>(
    null
  );
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

  async function createGameForSession(session: AuthResponse) {
    try {
      setError(null);
      setIsCreatingGame(true);
      prepareGameAudio();

      const result = await createGame(
        session.accessToken,
        toCreateGameRequest(session.user.lastGameSettings)
      );

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
      setIsCreatingGame(false);
    }
  }

  async function handleCreateGame() {
    if (!isReady) return;

    if (!isAuthenticated || !user || !accessToken) {
      setError(null);
      setPendingAuthAction({ type: "create" });
      setIsAuthModalOpen(true);
      return;
    }

    await createGameForSession({ accessToken, user });
  }

  async function joinExistingGameForSession(gameIdToJoin: string, session: AuthResponse) {
    try {
      setError(null);
      setIsJoiningGame(true);
      prepareGameAudio();

      const existingSession = getGameSession(gameIdToJoin);

      const result = await joinGame(
        gameIdToJoin,
        existingSession?.sessionToken,
        session.accessToken
      );

      saveGameSession({
        gameId: result.game.id,
        playerId: result.session.playerId,
        sessionToken: result.session.sessionToken,
        color: result.session.color,
        playerName: session.user.displayName,
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

    if (!isAuthenticated || !user || !accessToken) {
      setError(null);
      setPendingAuthAction({ type: "join", gameId: gameIdToJoin });
      setIsAuthModalOpen(true);
      return;
    }

    await joinExistingGameForSession(gameIdToJoin, { accessToken, user });
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

  function handleAuthenticated(session: AuthResponse) {
    if (!pendingAuthAction) {
      setIsAuthModalOpen(false);
      return;
    }

    const action = pendingAuthAction;
    setIsAuthModalOpen(false);
    setPendingAuthAction(null);

    if (action.type === "create") {
      void createGameForSession(session);
      return;
    }

    if (action.type === "join") {
      void joinExistingGameForSession(action.gameId, session);
      return;
    }

    openRoom(action.gameId);
  }

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
        onAuthenticated={handleAuthenticated}
        reason="Sign in to create or join a SuperChess room."
      />
    </LobbyShell>
  );
}
