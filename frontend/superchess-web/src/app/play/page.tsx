"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "../components/layout/Navbar";

type DemoGame = {
  id: string;
  whitePlayer: string;
  status: "waiting" | "active";
  createdAt: string;
};

const DEMO_GAMES: DemoGame[] = [
  {
    id: "a1f4c2d8",
    whitePlayer: "Pyke",
    status: "waiting",
    createdAt: "just now",
  },
  {
    id: "c9e7b1a4",
    whitePlayer: "GuestPlayer",
    status: "active",
    createdAt: "2 min ago",
  },
];

export default function PlayPage() {
  const [createName, setCreateName] = useState("");
  const [joinGameId, setJoinGameId] = useState("");
  const [joinName, setJoinName] = useState("");

  const waitingGames = useMemo(
    () => DEMO_GAMES.filter((game) => game.status === "waiting"),
    []
  );

  function handleCreateGame(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Create game:", { playerName: createName });
  }

  function handleJoinGame(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Join game:", { gameId: joinGameId, playerName: joinName });
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
              where you break the rythm with new moves, special abilities, extended boards
              and.. and...
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
                  Enter your player name and create a new game.
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
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Create Game
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Join by id
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Join an existing match
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
                  Use this while we are still keeping the frontend simple. Later this can
                  also connect from the games list or shared URLs.
                </p>
              </div>

              <form onSubmit={handleJoinGame} className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="joinGameId"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Game id
                  </label>
                  <input
                    id="joinGameId"
                    type="text"
                    value={joinGameId}
                    onChange={(e) => setJoinGameId(e.target.value)}
                    placeholder="Paste game id"
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
                    className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                  >
                    Join Game
                  </button>
                </div>
              </form>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Open games
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Waiting for a second player
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                This will be connected to the backend list endpoint next. For now it gives
                us the layout and interaction target.
              </p>
            </div>

            <div className="space-y-4">
              {waitingGames.map((game) => (
                <div
                  key={game.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Host</p>
                      <p className="mt-1 font-semibold text-white">{game.whitePlayer}</p>
                    </div>

                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                      {game.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-slate-400">
                    <p>Game id: {game.id}</p>
                    <p>Created: {game.createdAt}</p>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setJoinGameId(game.id)}
                      className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
                    >
                      Use id
                    </button>

                    <Link
                      href={`/play/${game.id}`}
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                    >
                      Open page
                    </Link>
                  </div>
                </div>
              ))}

              {waitingGames.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/50 p-6 text-sm text-slate-400">
                  No waiting games yet.
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
