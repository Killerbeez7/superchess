"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { SubmitEvent } from "react";

import { getPieceAtSquare, pieceBelongsToColor } from "@/utils/board/interactions";

import { useBoardSelection } from "@/features/game/hooks/useBoardSelection";
import type { GameResponse } from "@/types/game";

import { joinGame, makeMove } from "@/lib/api/games";
import type { LocalGameSession } from "@/lib/storage/gameSession";

import { ChessBoard } from "@/features/game/components/ChessBoard";
import { useGame } from "@/features/game/hooks/useGame";
import { useGameSession } from "@/features/game/hooks/useGameSession";
import { useGameRealtime } from "@/features/game/hooks/useGameRealtime";

import { Navbar } from "@/components/layout/Navbar";
import { LoadingSpinner } from "@/components/layout/LoadingSpinner";

export default function GameDetailsPage() {
  const params = useParams();
  const gameId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [joinName, setJoinName] = useState("");
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [isMakingMove, setIsMakingMove] = useState(false);

  const { session: localSession, saveSession } = useGameSession(gameId);
  const {
    game,
    setGame,
    isLoading: isLoadingGame,
    error,
    setError,
    refresh: handleRefreshGame,
  } = useGame(gameId);

  const {
    selectedSquare,
    setSelectedSquare,
    boardPosition,
    candidateSquares,
    lastMoveFrom,
    lastMoveTo,
  } = useBoardSelection(game, localSession);

  const handleMovePlayed = useCallback(
    (updatedGame: GameResponse) => {
      setGame(updatedGame);
      setSelectedSquare(null);
    },
    [setGame, setSelectedSquare]
  );
  const { isConnected: isRealtimeConnected } = useGameRealtime({
    gameId,
    onPlayerJoined: setGame,
    onMovePlayed: handleMovePlayed,
  });

  const canJoinAsBlack = !!game && !game.blackPlayer && game.status === "waiting";
  const activeColor = game?.whoseTurn === "black" ? "black" : "white";
  const whitePlayerName = game?.whitePlayer.displayName ?? "White player";
  const blackPlayerName = game?.blackPlayer?.displayName ?? "Waiting for black";
  const roomCode = game?.id ?? gameId ?? "";

  const isLocalPlayersTurn =
    !!localSession &&
    ((localSession.color === "white" && game?.whoseTurn === "white") ||
      (localSession.color === "black" && game?.whoseTurn === "black"));

  const isSameBrowserWhitePlayer =
    !!localSession && localSession.color === "white" && canJoinAsBlack;

  const canInteractWithBoard =
    !!game &&
    !!localSession &&
    game.status === "active" &&
    isLocalPlayersTurn &&
    !isMakingMove;

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

      const result = await joinGame(gameId, trimmedName, localSession?.sessionToken);

      const session: LocalGameSession = {
        gameId: result.game.id,
        playerId: result.session.playerId,
        sessionToken: result.session.sessionToken,
        color: result.session.color,
        playerName: trimmedName,
      };

      saveSession(session);

      setGame(result.game);
      setJoinName("");
      setSelectedSquare(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join game.");
    } finally {
      setIsJoiningGame(false);
    }
  }

  async function handleSquareClick(square: string) {
    if (!gameId || !game || !localSession) return;

    if (!canInteractWithBoard) {
      return;
    }

    setError(null);

    const clickedPiece = getPieceAtSquare(boardPosition, square);

    if (!selectedSquare) {
      if (!clickedPiece) return;

      if (!pieceBelongsToColor(clickedPiece, localSession.color)) {
        return;
      }

      setSelectedSquare(square);
      return;
    }

    if (square === selectedSquare) {
      setSelectedSquare(null);
      return;
    }

    if (clickedPiece && pieceBelongsToColor(clickedPiece, localSession.color)) {
      setSelectedSquare(square);
      return;
    }

    try {
      setIsMakingMove(true);

      const moveFrom = selectedSquare;
      const moveTo = square;

      const updatedGame = await makeMove(gameId, {
        from: moveFrom,
        to: moveTo,
        playerId: localSession.playerId,
        sessionToken: localSession.sessionToken,
      });

      setGame(updatedGame);

      setSelectedSquare(null);
    } catch {
      // setError(err instanceof Error ? err.message : "Failed to make move.");
      setSelectedSquare(null);
    } finally {
      setIsMakingMove(false);
    }
  }

  return (
    <main className="min-h-dvh bg-slate-950/97 text-white">
      <Navbar />

      <section className="min-h-[calc(100dvh-4.5rem)]">
        <div className="mx-auto grid min-h-[calc(100dvh-6rem)] max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8 lg:py-6">
          <div className="space-y-5">
            {isLoadingGame ? (
              <section className="flex min-h-[520px] items-center justify-center rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
                <LoadingSpinner />
              </section>
            ) : game ? (
              <ChessBoard
                variant="app"
                position={boardPosition}
                interactive={canInteractWithBoard}
                selectedSquare={selectedSquare}
                candidateSquares={candidateSquares}
                lastMoveFrom={lastMoveFrom}
                lastMoveTo={lastMoveTo}
                onSquareClick={handleSquareClick}
              />
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

          <aside className="lg:h-[calc(100dvh-8rem)]">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur lg:flex lg:h-full lg:flex-col lg:overflow-hidden">
              <div className="flex items-start justify-between gap-4">
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

              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Room code
                </p>
                <p className="mt-1.5 break-all font-mono text-[13px] text-slate-400">
                  {roomCode}
                </p>
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="mb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Players
                  </p>
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
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                {!localSession ? (
                  <>
                    <div className="mb-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Room
                      </p>

                      {canJoinAsBlack && (
                        <h3 className="mt-1 text-sm font-semibold text-white">
                          Take the black side
                        </h3>
                      )}

                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {canJoinAsBlack
                          ? "Enter your name to sit across from white."
                          : game?.blackPlayer
                          ? "Both players are seated."
                          : "Waiting for an opponent."}
                      </p>
                    </div>

                    {canJoinAsBlack && !isSameBrowserWhitePlayer && (
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

                    {canJoinAsBlack && isSameBrowserWhitePlayer && (
                      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                        This browser session already owns the white seat, so joining as
                        black is blocked here too.
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Moves
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-white">History</h3>
                    </div>

                    {game?.moves?.length ? (
                      <div className="space-y-2">
                        {game.moves.map((move) => (
                          <div
                            key={move.moveNumber}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/75 px-3 py-2 text-sm"
                          >
                            <span className="min-w-8 text-xs text-slate-500">
                              {move.moveNumber}.
                            </span>
                            <span className="flex-1 text-slate-200">
                              {move.playerColor === "white" ? "W" : "B"} {move.from} →{" "}
                              {move.to}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-3.5 text-[13px] text-slate-500">
                        No moves yet.
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="grid gap-3">
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
      className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 ${
        isActive
          ? "border-amber-300/30 bg-amber-300/8"
          : "border-white/10 bg-slate-950/80"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`h-9 w-9 shrink-0 rounded-full border ${
            color === "white"
              ? "border-slate-300 bg-slate-100"
              : "border-slate-700 bg-slate-950"
          }`}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{detail}</p>
        </div>
      </div>

      <div className="shrink-0">
        {isActive ? (
          <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200">
            Turn
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-500">Waiting</span>
        )}
      </div>
    </div>
  );
}
