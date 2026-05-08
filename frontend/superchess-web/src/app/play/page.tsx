"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import type { HubConnection } from "@microsoft/signalr";

import { Navbar } from "../components/layout/Navbar";
import { createGame, getGames, joinGame, type GameResponse } from "@/api/games";
import { createGameHubConnection } from "@/realtime/gameHub";
import { LoadingSpinner } from "../components/layout/LoadingSpinner";

export default function PlayPage() {
  const router = useRouter();
  const connectionRef = useRef<HubConnection | null>(null);

  const [createName, setCreateName] = useState("");
  const [joinGameId, setJoinGameId] = useState("");
  const [joinName, setJoinName] = useState("");

  const [games, setGames] = useState<GameResponse[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const connection = createGameHubConnection();
    connectionRef.current = connection;

    let disposed = false;
    let started = false;

    connection.on("OpenGamesChanged", (updatedGames: GameResponse[]) => {
      if (!disposed) {
        setGames(updatedGames);
      }
    });

    async function startConnection() {
      try {
        await connection.start();
        started = true;

        if (!disposed) {
          setIsRealtimeConnected(true);
          return;
        }

        await connection.stop();
      } catch (err) {
        if (!disposed) {
          console.error("Lobby SignalR connection failed:", err);
          setIsRealtimeConnected(false);
        }
      }
    }

    void startConnection();

    return () => {
      disposed = true;

      async function cleanup() {
        try {
          connection.off("OpenGamesChanged");

          if (started && connection.state !== "Disconnected") {
            await connection.stop();
          }
        } catch (err) {
          console.error("Lobby SignalR cleanup failed:", err);
        } finally {
          setIsRealtimeConnected(false);
        }
      }

      void cleanup();
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

  async function handleCreateGame(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedName = createName.trim();

    if (!trimmedName) {
      setError("Player name is required.");
      return;
    }

    try {
      setError(null);
      setIsCreatingGame(true);

      const game = await createGame(trimmedName);
      setCreateName("");
      router.push(`/play/${game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game.");
    } finally {
      setIsCreatingGame(false);
    }
  }

  async function handleJoinGame(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedName = joinName.trim();
    const trimmedGameId = joinGameId.trim();

    if (!trimmedGameId) {
      setError("Game id is required.");
      return;
    }

    if (!trimmedName) {
      setError("Player name is required.");
      return;
    }

    try {
      setError(null);
      setIsJoiningGame(true);

      const game = await joinGame(trimmedGameId, trimmedName);
      setJoinName("");
      router.push(`/play/${game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join game.");
    } finally {
      setIsJoiningGame(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950/97 text-white">
      <Navbar />

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
              Play
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Create or join a game.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Dive into the universe of superchess. A modern twist on classic chess —
              where you break the rhythm with new moves, special abilities, extended
              boards and...
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16">
          <div className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  New game
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Start as white</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
                  Enter your player name and create a new game room.
                </p>
              </div>

              <form onSubmit={handleCreateGame} className="space-y-4">
                <div>
                  <label
                    htmlFor="createName"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Player name
                  </label>
                  <input
                    id="createName"
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingGame}
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingGame ? "Creating..." : "Create Game"}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Join by code
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Join an existing match
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
                  Paste a room code and join as the second player.
                </p>
              </div>

              <form onSubmit={handleJoinGame} className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="joinGameId"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Room code
                  </label>
                  <input
                    id="joinGameId"
                    type="text"
                    value={joinGameId}
                    onChange={(e) => setJoinGameId(e.target.value)}
                    placeholder="Paste room code"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400"
                  />
                </div>

                <div className="sm:col-span-2">
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

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isJoiningGame}
                    className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isJoiningGame ? "Joining..." : "Join Game"}
                  </button>
                </div>
              </form>
            </div>
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Open games
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Waiting for a second player
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Live waiting rooms from the backend.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isRealtimeConnected
                      ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                  }`}
                >
                  {isRealtimeConnected ? "Live" : "Offline"}
                </span>

                <button
                  type="button"
                  onClick={handleRefreshGames}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {isLoadingGames ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/50 p-6 text-sm text-slate-400">
                  <LoadingSpinner />
                </div>
              ) : waitingGames.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/50 p-6 text-sm text-slate-400">
                  No waiting games yet.
                </div>
              ) : (
                waitingGames.map((game) => (
                  <div
                    key={game.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Host</p>
                        <p className="mt-1 font-semibold text-white">
                          {game.whitePlayer.displayName}
                        </p>
                      </div>

                      <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                        Waiting
                      </span>
                    </div>

                    <div className="mt-4 space-y-1 text-sm text-slate-400">
                      <p>Room code: {game.id}</p>
                      <p>
                        Turn: <span className="text-slate-200">{game.whoseTurn}</span>
                      </p>
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setJoinGameId(game.id)}
                        className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
                      >
                        Use code
                      </button>

                      <Link
                        href={`/play/${game.id}`}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                      >
                        Open room
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
