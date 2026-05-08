"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import type { GameResponse } from "@/api/games";
import { getGame, joinGame } from "@/api/games";
import { ChessBoardPlaceholder } from "@components/game/ChessBoardPlaceholder";
import { Navbar } from "@components/layout/Navbar";
import { LoadingSpinner } from "@components/layout/LoadingSpinner";
import { createGameHubConnection } from "@/realtime/gameHub";

export default function GameDetailsPage() {
  const params = useParams();
  const gameId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [joinName, setJoinName] = useState("");
  const [game, setGame] = useState<GameResponse | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState(true);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canJoinAsBlack = !!game && !game.blackPlayer && game.status === "waiting";
  const activeColor = game?.whoseTurn === "black" ? "black" : "white";
  const whitePlayerName = game?.whitePlayer.displayName ?? "White player";
  const blackPlayerName = game?.blackPlayer?.displayName ?? "Waiting for black";
  const roomCode = game?.id ?? gameId ?? "";

  const statusLabel =
    game?.status === "waiting"
      ? "Waiting for player"
      : game?.status === "active"
      ? "Match ready"
      : game?.status ?? "Unknown";

  const turnLabel =
    game?.whoseTurn === "white"
      ? "White to move"
      : game?.whoseTurn === "black"
      ? "Black to move"
      : "Turn not available";

  useEffect(() => {
    let cancelled = false;

    async function fetchGame() {
      if (!gameId) {
        setError("Missing game id.");
        setIsLoadingGame(false);
        return;
      }

      try {
        setError(null);
        const data = await getGame(gameId);

        if (!cancelled) {
          setGame(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load game.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingGame(false);
        }
      }
    }

    void fetchGame();

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;

    const connection = createGameHubConnection();

    let disposed = false;
    let started = false;
    let joinedRoom = false;

    connection.on("PlayerJoined", (updatedGame: GameResponse) => {
      if (!disposed) {
        setGame(updatedGame);
      }
    });

    async function startConnection() {
      try {
        await connection.start();
        started = true;

        if (disposed) {
          await connection.stop();
          return;
        }

        await connection.invoke("JoinGameRoom", gameId);
        joinedRoom = true;

        if (!disposed) {
          setIsRealtimeConnected(true);
        }
      } catch (err) {
        if (!disposed) {
          console.error("SignalR connection failed:", err);
          setIsRealtimeConnected(false);
        }
      }
    }

    void startConnection();

    return () => {
      disposed = true;

      async function cleanup() {
        try {
          connection.off("PlayerJoined");

          if (joinedRoom && connection.state === "Connected") {
            try {
              await connection.invoke("LeaveGameRoom", gameId);
            } catch {}
          }

          if (started && connection.state !== "Disconnected") {
            await connection.stop();
          }
        } catch (err) {
          console.error("SignalR cleanup failed:", err);
        } finally {
          setIsRealtimeConnected(false);
        }
      }

      void cleanup();
    };
  }, [gameId]);

  async function handleRefreshGame() {
    if (!gameId) return;

    try {
      setError(null);
      setIsLoadingGame(true);

      const data = await getGame(gameId);
      setGame(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game.");
    } finally {
      setIsLoadingGame(false);
    }
  }

  async function handleJoinGame(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!gameId) {
      setError("Missing game id.");
      return;
    }

    const trimmedName = joinName.trim();

    if (!trimmedName) {
      setError("Player name is required.");
      return;
    }

    try {
      setError(null);
      setIsJoiningGame(true);

      const updatedGame = await joinGame(gameId, trimmedName);
      setGame(updatedGame);
      setJoinName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join game.");
    } finally {
      setIsJoiningGame(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950/97 text-white">
      <Navbar />

      <section>
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-8">
          <div className="space-y-5">
            {isLoadingGame ? (
              <section className="flex min-h-[520px] items-center justify-center rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
                <LoadingSpinner />
              </section>
            ) : game ? (
              <ChessBoardPlaceholder variant="app" />
            ) : (
              <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-sm text-red-200">
                Game not found.
              </section>
            )}

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Players
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white">Table</h2>
                </div>

                <span className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-300">
                  {turnLabel}
                </span>
              </div>

              {isLoadingGame ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/70 p-6">
                  <LoadingSpinner />
                </div>
              ) : game ? (
                <div className="grid gap-3">
                  <PlayerPanel
                    color="white"
                    name={whitePlayerName}
                    detail="White"
                    isActive={activeColor === "white"}
                  />
                  <PlayerPanel
                    color="black"
                    name={blackPlayerName}
                    detail={game.blackPlayer ? "Black" : "Open seat"}
                    isActive={activeColor === "black"}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                  No table data available.
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Room
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white">
                    {canJoinAsBlack ? "Take the black side" : statusLabel}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {canJoinAsBlack
                      ? "Enter your name to sit across from white."
                      : game?.blackPlayer
                      ? "Both players are seated."
                      : "Waiting for an opponent."}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isRealtimeConnected
                      ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                  }`}
                >
                  {isRealtimeConnected ? "Live" : "Offline"}
                </span>
              </div>

              {canJoinAsBlack && (
                <form onSubmit={handleJoinGame} className="space-y-4">
                  <div>
                    <label
                      htmlFor="joinName"
                      className="mb-2 block text-sm font-medium text-slate-200"
                    >
                      Player name
                    </label>
                    <input
                      id="joinName"
                      type="text"
                      value={joinName}
                      onChange={(e) => setJoinName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isJoiningGame}
                    className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isJoiningGame ? "Joining..." : "Join as black"}
                  </button>
                </form>
              )}

              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Room code
                </p>
                <p className="mt-2 break-all font-mono text-sm text-slate-300">
                  {roomCode}
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={handleRefreshGame}
                  className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  Refresh room
                </button>

                <Link
                  href="/play"
                  className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  Browse rooms
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function PlayerPanel({
  color,
  name,
  detail,
  isActive,
}: {
  color: "white" | "black";
  name: string;
  detail: string;
  isActive: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${
        isActive
          ? "border-amber-300/40 bg-amber-300/10"
          : "border-white/10 bg-slate-900/70"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`h-10 w-10 shrink-0 rounded-full border ${
            color === "white"
              ? "border-slate-300 bg-slate-100"
              : "border-slate-700 bg-slate-950"
          }`}
        />
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{name}</p>
          <p className="text-sm text-slate-400">{detail}</p>
        </div>
      </div>

      {isActive && (
        <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
          Turn
        </span>
      )}
    </div>
  );
}
