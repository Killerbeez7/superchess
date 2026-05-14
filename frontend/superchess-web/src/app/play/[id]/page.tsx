"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { LoadingSpinner } from "@/components/layout/LoadingSpinner";
import { ChessBoard } from "@/features/game/components/ChessBoard";
import { GameEndBanner } from "@/features/game/components/GameEndBanner";
import { GamePlayerBar } from "@/features/game/components/GamePlayerBar";
import { GameUtilityRail } from "@/features/game/components/GameUtilityRail";
import { PlayerIdentitySetup } from "@/features/game/components/PlayerIdentitySetup";
import { PromotionPicker } from "@/features/game/components/PromotionPicker";
// hooks
import { useGame } from "@/features/game/hooks/useGame";
import { useGameSession } from "@/features/game/hooks/useGameSession";
import { useGameRealtime } from "@/features/game/hooks/useGameRealtime";
import { useBoardSelection } from "@/features/game/hooks/useBoardSelection";
import { useGameActions } from "@/features/game/hooks/useGameActions";
import { useGameClocks } from "@/features/game/hooks/useGameClocks";
import { usePlayerIdentity } from "@/features/game/hooks/usePlayerIdentity";
import { useGameAutoJoin } from "@/features/game/hooks/useGameAutoJoin";
import { useGameSounds } from "@/features/game/hooks/useGameSounds";

import {
  getEnPassantSquareFromFen,
  getCandidateSquares,
  getPieceAtSquare,
  isKingInCheck,
  pieceBelongsToColor,
  squareToCoords,
} from "@/utils/board/interactions";
import type { GameResponse, PieceColor } from "@/types/game";
import { getBoardPositionFromGameState } from "@/utils/board/position";
import type { BoardPiece } from "@/utils/board/position";
import type { GameSoundName } from "@/features/game/hooks/useGameSounds";

function getMoveSounds(
  previousGame: GameResponse | null,
  updatedGame: GameResponse,
  localColor?: PieceColor
): GameSoundName[] {
  if (updatedGame.status === "completed") {
    return updatedGame.endReason === "checkmate"
      ? ["check", "game_end"]
      : ["game_end"];
  }

  const latestMove = updatedGame.moves[updatedGame.moves.length - 1];
  if (!previousGame || !latestMove) return ["move"];

  const previousPosition = getBoardPositionFromGameState(previousGame.currentFen);
  const updatedPosition = getBoardPositionFromGameState(updatedGame.currentFen);
  const movingPiece = getPieceAtSquare(previousPosition, latestMove.from);

  if (!movingPiece) return ["move"];

  const fromCoords = squareToCoords(latestMove.from);
  const toCoords = squareToCoords(latestMove.to);
  const targetPiece = getPieceAtSquare(previousPosition, latestMove.to);

  const isCastle =
    movingPiece.type === "king" && Math.abs(toCoords.col - fromCoords.col) === 2;
  if (isCastle) return ["castle"];

  const isPromotion =
    movingPiece.type === "pawn" &&
    (latestMove.to.endsWith("8") || latestMove.to.endsWith("1"));
  if (isPromotion) return ["promote"];

  if (isKingInCheck(updatedPosition, updatedGame.whoseTurn)) return ["check"];

  const isEnPassantCapture =
    movingPiece.type === "pawn" &&
    fromCoords.col !== toCoords.col &&
    !targetPiece &&
    getEnPassantSquareFromFen(previousGame.currentFen) === latestMove.to;
  const isCapture =
    (targetPiece && targetPiece.color !== movingPiece.color) || isEnPassantCapture;

  if (isCapture) return ["capture"];

  return localColor && latestMove.playerColor !== localColor
    ? ["move_opponent"]
    : ["move"];
}

function playSounds(
  playSound: (name: GameSoundName) => void,
  sounds: GameSoundName[]
) {
  sounds.forEach((sound, index) => {
    if (index === 0) {
      playSound(sound);
      return;
    }

    window.setTimeout(() => playSound(sound), 180 * index);
  });
}

export default function GameDetailsPage() {
  const params = useParams();
  const gameId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [optimisticFen, setOptimisticFen] = useState<string | null>(null);
  const [isEndModalDismissed, setIsEndModalDismissed] = useState(false);
  const pendingTapMoveFromRef = useRef<string | null>(null);
  const timeoutRefreshKeyRef = useRef<string | null>(null);

  const { game, setGame, isLoading, error, setError, refresh } = useGame(gameId);
  const { session, saveSession } = useGameSession(gameId);
  const { identity, isReady: isIdentityReady, setDisplayName } = usePlayerIdentity();
  const { whiteTimer, blackTimer, whiteTimeRemainingMs, blackTimeRemainingMs } =
    useGameClocks(game);
  const displayedFen = optimisticFen ?? game?.currentFen;
  const {
    selectedSquare,
    setSelectedSquare,
    boardPosition,
    enPassantSquare,
    candidateSquares,
    lastMoveFrom,
    lastMoveTo,
  } = useBoardSelection(game, session, displayedFen);

  const { playSound, unlockSound } = useGameSounds();
  const handleIllegalMoveSound = useCallback(() => {
    playSound("illegal");
  }, [playSound]);

  const handlePlayerJoined = useCallback(
    (updated: GameResponse) => {
      const startedGame = game?.status === "waiting" && updated.status === "active";

      setGame(updated);
      setOptimisticFen(null);

      if (startedGame) {
        playSound("game_start");
      }
    },
    [game?.status, playSound, setGame]
  );

  const handleMovePlayed = useCallback(
    (updated: GameResponse) => {
      const sounds = getMoveSounds(game, updated, session?.color);

      setGame(updated);
      setOptimisticFen(null);
      setSelectedSquare(null);
      playSounds(playSound, sounds);
    },
    [game, playSound, session?.color, setGame, setSelectedSquare]
  );

  const { isConnected } = useGameRealtime({
    gameId,
    onPlayerJoined: handlePlayerJoined,
    onMovePlayed: handleMovePlayed,
  });

  const {
    handleJoin,
    handleMoveAttempt,
    handlePromotionSelect,
    handlePromotionCancel,
    pendingPromotionMove,
    isJoining,
    canInteractWithBoard,
  } = useGameActions({
    gameId,
    game,
    session,
    saveSession,
    setGame,
    setError,
    selectedSquare,
    setSelectedSquare,
    setOptimisticFen,
    boardPosition,
    enPassantSquare,
    onIllegalMove: handleIllegalMoveSound,
  });

  const handleSaveIdentity = useCallback(
    (displayName: string) => {
      try {
        setError(null);
        setDisplayName(displayName);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save player name.");
      }
    },
    [setDisplayName, setError]
  );

  const handleJoinWithIdentity = useCallback(async () => {
    void unlockSound();

    if (!identity) {
      setError("Player name is required.");
      return;
    }

    await handleJoin(identity.displayName);
  }, [handleJoin, identity, setError, unlockSound]);

  useGameAutoJoin({
    gameId,
    game,
    identity,
    isIdentityReady,
    session,
    handleJoin,
  });

  const handleRefresh = useCallback(async () => {
    await refresh();
    setOptimisticFen(null);
    setSelectedSquare(null);
  }, [refresh, setSelectedSquare]);

  const currentTurnTimeRemainingMs =
    game?.whoseTurn === "white" ? whiteTimeRemainingMs : blackTimeRemainingMs;
  const timedOutColor =
    game?.status === "active" && currentTurnTimeRemainingMs <= 0 ? game.whoseTurn : null;
  const timeoutRefreshKey =
    game && timedOutColor
      ? `${game.id}:${timedOutColor}:${game.turnStartedAtUtc ?? game.updatedAtUtc}`
      : null;

  useEffect(() => {
    if (!timeoutRefreshKey || timeoutRefreshKeyRef.current === timeoutRefreshKey) {
      return;
    }

    timeoutRefreshKeyRef.current = timeoutRefreshKey;
    void refresh({ silent: true });
  }, [refresh, timeoutRefreshKey]);

  const canUseBoardInput =
    !!game && !!session && game.status === "active" && !timedOutColor;

  const canMoveOwnPieces = canInteractWithBoard && !timedOutColor;

  const showEndModal =
    !!game && (game.status === "completed" || !!timedOutColor) && !isEndModalDismissed;

  useEffect(() => {
    const handleGameStatus = async () => {
      if (game?.status === "active" && !timedOutColor) {
        setIsEndModalDismissed(false);
      }
    };

    handleGameStatus();
  }, [game?.status, timedOutColor]);

  const isOwnPlayablePiece = useCallback(
    (piece: BoardPiece | null) =>
      !!piece &&
      canMoveOwnPieces &&
      !!session &&
      pieceBelongsToColor(piece, session.color),
    [canMoveOwnPieces, session]
  );

  const handleBoardPiecePress = useCallback(
    (square: string, piece: BoardPiece) => {
      void unlockSound();

      const selectedPiece = selectedSquare
        ? getPieceAtSquare(boardPosition, selectedSquare)
        : null;
      const selectedOwnPlayable = isOwnPlayablePiece(selectedPiece);
      const pressedOwnPlayable = isOwnPlayablePiece(piece);
      let pendingTapMoveFrom: string | null = null;

      if (selectedOwnPlayable && selectedSquare !== square && !pressedOwnPlayable) {
        const candidates =
          selectedPiece && selectedSquare
            ? getCandidateSquares(
                boardPosition,
                selectedSquare,
                selectedPiece,
                enPassantSquare
              )
            : [];

        if (candidates.includes(square)) {
          pendingTapMoveFrom = selectedSquare;
        }
      }

      if (selectedSquare === square) {
        pendingTapMoveFromRef.current = null;
        return false;
      }

      pendingTapMoveFromRef.current = pendingTapMoveFrom;
      setSelectedSquare(square);
      return pendingTapMoveFrom === null;
    },
    [
      boardPosition,
      enPassantSquare,
      isOwnPlayablePiece,
      selectedSquare,
      setSelectedSquare,
      unlockSound,
    ]
  );

  const handleBoardTap = useCallback(
    async (square: string) => {
      void unlockSound();

      const pendingTapMoveFrom = pendingTapMoveFromRef.current;
      pendingTapMoveFromRef.current = null;

      if (pendingTapMoveFrom) {
        const pendingPiece = getPieceAtSquare(boardPosition, pendingTapMoveFrom);

        if (pendingPiece && isOwnPlayablePiece(pendingPiece)) {
          const candidates = getCandidateSquares(
            boardPosition,
            pendingTapMoveFrom,
            pendingPiece,
            enPassantSquare
          );

          if (candidates.includes(square)) {
            await handleMoveAttempt(pendingTapMoveFrom, square);
            return;
          }
        }
      }

      const clickedPiece = getPieceAtSquare(boardPosition, square);
      const selectedPiece = selectedSquare
        ? getPieceAtSquare(boardPosition, selectedSquare)
        : null;
      const selectedOwnPlayable = isOwnPlayablePiece(selectedPiece);

      if (selectedOwnPlayable && selectedSquare && selectedPiece) {
        if (square === selectedSquare) {
          setSelectedSquare(null);
          return;
        }

        if (clickedPiece && isOwnPlayablePiece(clickedPiece)) {
          setSelectedSquare(square);
          return;
        }

        const candidates = getCandidateSquares(
          boardPosition,
          selectedSquare,
          selectedPiece,
          enPassantSquare
        );

        if (candidates.includes(square)) {
          await handleMoveAttempt(selectedSquare, square);
          return;
        }

        setSelectedSquare(null);
        return;
      }

      if (clickedPiece) {
        setSelectedSquare(selectedSquare === square ? null : square);
        return;
      }

      setSelectedSquare(null);
    },
    [
      boardPosition,
      handleMoveAttempt,
      isOwnPlayablePiece,
      selectedSquare,
      setSelectedSquare,
      enPassantSquare,
      unlockSound,
    ]
  );

  const handleBoardDragEnd = useCallback(
    async (from: string, releasedOn: string | null) => {
      void unlockSound();

      pendingTapMoveFromRef.current = null;
      const sourcePiece = getPieceAtSquare(boardPosition, from);

      if (!sourcePiece) {
        setSelectedSquare(null);
        return;
      }

      if (!isOwnPlayablePiece(sourcePiece)) {
        setSelectedSquare(from);
        return;
      }

      if (!releasedOn || releasedOn === from) {
        setSelectedSquare(from);
        return;
      }

      const candidates = getCandidateSquares(
        boardPosition,
        from,
        sourcePiece,
        enPassantSquare
      );

      if (!candidates.includes(releasedOn)) {
        handleIllegalMoveSound();
        setSelectedSquare(from);
        return;
      }

      await handleMoveAttempt(from, releasedOn);
    },
    [
      boardPosition,
      enPassantSquare,
      handleMoveAttempt,
      handleIllegalMoveSound,
      isOwnPlayablePiece,
      setSelectedSquare,
      unlockSound,
    ]
  );

  const canJoinAsBlack = !!game && !game.blackPlayer && game.status === "waiting";
  const canTakeBlackSeat = canJoinAsBlack && !session;
  const isWhiteTurn = game?.status === "active" && game.whoseTurn === "white";
  const isBlackTurn = game?.status === "active" && game.whoseTurn === "black";
  const blackPlayerName = game?.blackPlayer?.displayName ?? "Waiting for player 2";
  const whitePlayerName = game?.whitePlayer.displayName ?? "Waiting for player 1";
  const boardPerspective = session?.color ?? "white";

  const whitePlayerView = {
    name: whitePlayerName,
    color: "white" as const,
    timer: whiteTimer,
    timeRemainingMs: whiteTimeRemainingMs,
    isActive: isWhiteTurn,
    action: null,
  };

  const blackPlayerView = {
    name: blackPlayerName,
    color: "black" as const,
    timer: game?.blackPlayer ? blackTimer : "--:--",
    timeRemainingMs: game?.blackPlayer ? blackTimeRemainingMs : undefined,
    isActive: isBlackTurn,
    action:
      canTakeBlackSeat && identity ? (
        <button
          type="button"
          onClick={handleJoinWithIdentity}
          disabled={isJoining}
          className="rounded-md bg-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isJoining ? "Joining..." : "Join"}
        </button>
      ) : null,
  };

  const topPlayerView = boardPerspective === "white" ? blackPlayerView : whitePlayerView;

  const bottomPlayerView =
    boardPerspective === "white" ? whitePlayerView : blackPlayerView;

  return (
    <main className="min-h-dvh bg-slate-950/97 text-white">
      <Navbar />
      <section className="min-h-[calc(100dvh-4.5rem)]">
        <div className="mx-auto grid min-h-[calc(100dvh-6rem)] w-full max-w-6xl gap-5 px-4 py-3 sm:px-6 lg:grid-cols-[minmax(0,820px)_210px] lg:items-start lg:px-8 lg:py-4">
          <div className="mx-auto w-full max-w-[min(92vw,78dvh,820px)] space-y-2 lg:mx-0">
            {isLoading ? (
              <section className="flex min-h-[520px] items-center justify-center rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
                <LoadingSpinner />
              </section>
            ) : game ? (
              <>
                <GamePlayerBar
                  name={topPlayerView.name}
                  color={topPlayerView.color}
                  timer={topPlayerView.timer}
                  timeRemainingMs={topPlayerView.timeRemainingMs}
                  isActive={topPlayerView.isActive}
                  action={topPlayerView.action}
                />

                {canTakeBlackSeat && !isIdentityReady && (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/70 p-6">
                    <LoadingSpinner />
                  </div>
                )}

                <div className="relative select-none">
                  <ChessBoard
                    variant="app"
                    perspective={boardPerspective}
                    position={boardPosition}
                    interactive={canUseBoardInput}
                    selectedSquare={selectedSquare}
                    candidateSquares={candidateSquares}
                    lastMoveFrom={lastMoveFrom}
                    lastMoveTo={lastMoveTo}
                    onPiecePress={handleBoardPiecePress}
                    onSquareTap={handleBoardTap}
                    onDragEnd={handleBoardDragEnd}
                  />

                  {showEndModal && (
                    <GameEndBanner
                      game={game}
                      timedOutColor={timedOutColor}
                      onDismiss={() => setIsEndModalDismissed(true)}
                    />
                  )}

                  {canTakeBlackSeat && isIdentityReady && !identity && (
                    <PlayerIdentitySetup onSave={handleSaveIdentity} />
                  )}
                </div>

                {pendingPromotionMove && (
                  <PromotionPicker
                    color={pendingPromotionMove.color}
                    onSelect={(promotion) => {
                      void unlockSound();
                      void handlePromotionSelect(promotion);
                    }}
                    onCancel={handlePromotionCancel}
                  />
                )}

                <GamePlayerBar
                  name={bottomPlayerView.name}
                  color={bottomPlayerView.color}
                  timer={bottomPlayerView.timer}
                  timeRemainingMs={bottomPlayerView.timeRemainingMs}
                  isActive={bottomPlayerView.isActive}
                  action={bottomPlayerView.action}
                />
              </>
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

          <GameUtilityRail
            roomCode={game?.id ?? gameId ?? ""}
            isConnected={isConnected}
            onRefresh={handleRefresh}
          />
        </div>
      </section>
    </main>
  );
}
