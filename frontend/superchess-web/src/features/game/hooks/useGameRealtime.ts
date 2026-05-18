"use client";

import { useEffect, useState } from "react";
import { createGameHubConnection } from "@/lib/realtime/gameHub";
import { normalizeGameResponse, normalizeGameResponses } from "@/lib/api/games";
import type { GameResponse } from "@/types/game";

type Handler = (game: GameResponse) => void;
type OpenGamesHandler = (games: GameResponse[]) => void;

type UseGameRealtimeOptions = {
  gameId?: string;
  onPlayerJoined?: Handler;
  onMovePlayed?: Handler;
  onOpenGamesChanged?: OpenGamesHandler;
};

export function useGameRealtime({
  gameId,
  onPlayerJoined,
  onMovePlayed,
  onOpenGamesChanged,
}: UseGameRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!gameId && !onOpenGamesChanged) return;

    const connection = createGameHubConnection();
    let isAlive = true;
    let didJoinRoom = false;
    let didJoinLobby = false;

    if (onPlayerJoined) {
      connection.on("PlayerJoined", (game: GameResponse) => {
        onPlayerJoined(normalizeGameResponse(game));
      });
    }

    if (onMovePlayed) {
      connection.on("MovePlayed", (game: GameResponse) => {
        onMovePlayed(normalizeGameResponse(game));
      });
    }

    if (onOpenGamesChanged) {
      connection.on("OpenGamesChanged", (games: GameResponse[]) => {
        onOpenGamesChanged(normalizeGameResponses(games));
      });
    }

    (async () => {
      try {
        await connection.start();

        if (!isAlive) {
          await connection.stop();
          return;
        }

        if (onOpenGamesChanged) {
          await connection.invoke("JoinLobby");
          didJoinLobby = true;
        }

        if (gameId) {
          await connection.invoke("JoinGameRoom", gameId);
          didJoinRoom = true;
        }

        if (!isAlive) {
          await connection.stop();
          return;
        }

        setIsConnected(true);
      } catch (err) {
        if (isAlive) {
          console.error("SignalR connection failed:", err);
          setIsConnected(false);
        }
      }
    })();

    return () => {
      isAlive = false;
      setIsConnected(false);

      connection.off("PlayerJoined");
      connection.off("MovePlayed");
      connection.off("OpenGamesChanged");

      void (async () => {
        try {
          if (didJoinLobby && connection.state === "Connected") {
            await connection.invoke("LeaveLobby").catch(() => {});
          }

          if (gameId && didJoinRoom && connection.state === "Connected") {
            await connection.invoke("LeaveGameRoom", gameId).catch(() => {});
          }

          if (connection.state === "Connected") {
            await connection.stop();
          }
        } catch (err) {
          console.error("SignalR cleanup failed:", err);
        }
      })();
    };
  }, [gameId, onPlayerJoined, onMovePlayed, onOpenGamesChanged]);

  return { isConnected };
}
