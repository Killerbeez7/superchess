"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import type { HubConnection } from "@microsoft/signalr";
import { Navbar } from "../../components/layout/Navbar";
import { getGame, joinGame, type GameResponse } from "@/api/games";
import { createGameHubConnection } from "@/realtime/gameHub";

export default function GameDetailsPage() {
  const params = useParams();
  const gameId = Array.isArray(params.id) ? params.id[0] : params.id;

  const connectionRef = useRef<HubConnection | null>(null);

  const [joinName, setJoinName] = useState("");
  const [game, setGame] = useState<GameResponse | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState(true);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canJoinAsBlack = !!game && !game.blackPlayer && game.status === "waiting";

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
    connectionRef.current = connection;

    let disposed = false;
    let started = false;
    let joinedRoom = false;

    connection.on("PlayerJoined", (updatedGame: GameResponse) => {
      setGame(updatedGame);
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

  return (
    <main className="min-h-screen bg-slate-950/97 text-white">
      <Navbar />

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
                Match room
              </p>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                SuperChess Lobby
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Create the matchup, invite the second player, and prepare the board before
                the game begins.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span
                className={`rounded-full px-5 py-3 text-sm font-semibold ${
                  isRealtimeConnected
                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                }`}
              >
                {isRealtimeConnected ? "Live" : "Connecting..."}
              </span>

              <button
                type="button"
                onClick={handleRefreshGame}
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Refresh
              </button>

              <Link
                href="/play"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Back to play
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-14">
          <div className="space-y-8">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
              <div className="border-b border-white/10 px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Current match
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Player lineup
                    </h2>
                  </div>

                  {!isLoadingGame && game && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                        game.status === "waiting"
                          ? "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                          : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  )}
                </div>
              </div>

              {isLoadingGame ? (
                <div className="px-6 py-8">
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/50 p-6 text-sm text-slate-400">
                    Loading game...
                  </div>
                </div>
              ) : game ? (
                <div className="space-y-6 px-6 py-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        White side
                      </p>
                      <p className="mt-3 text-lg font-semibold text-white">
                        {game.whitePlayer.displayName}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">Host of this match</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Black side
                      </p>
                      <p className="mt-3 text-lg font-semibold text-white">
                        {game.blackPlayer?.displayName ?? "Waiting for player 2"}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        {game.blackPlayer
                          ? "Second player connected"
                          : "Open for another player to join"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Match status
                      </p>
                      <p className="mt-3 text-base font-semibold text-white">
                        {statusLabel}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Turn
                      </p>
                      <p className="mt-3 text-base font-semibold text-white">
                        {turnLabel}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Room code
                    </p>
                    <p className="mt-2 break-all font-mono text-sm text-slate-300">
                      {game.id}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-8">
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">
                    Game not found.
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Match actions
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {canJoinAsBlack ? "Join this match" : "Lobby status"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {canJoinAsBlack
                  ? "Take the black side and get ready to start."
                  : game?.blackPlayer
                  ? "Both players are in. The game can begin."
                  : "Waiting for the room to become available."}
              </p>
            </div>

            {canJoinAsBlack ? (
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
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400"
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
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                {game?.blackPlayer
                  ? "This match already has two players."
                  : "Open a valid waiting room to join the game."}
              </div>
            )}

            <div className="mt-6 grid gap-3">
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
                Browse other games
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
