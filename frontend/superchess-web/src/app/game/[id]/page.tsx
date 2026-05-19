"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import type { AuthResponse } from "@/features/auth/api/auth";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ChessBoard } from "@/features/game/components/board/ChessBoard";
import { GameEndBanner } from "@/features/game/components/GameEndBanner";
import { GamePlayerBar } from "@/features/game/components/GamePlayerBar";
import { GameStartOverlay } from "@/features/game/components/GameStartOverlay";
import { PromotionPicker } from "@/features/game/components/PromotionPicker";
// components
import { GameRoomShell } from "@/features/game/components/room/GameRoomShell";
import { GameTable } from "@/features/game/components/room/GameTable";
import { GameRightSidebar } from "@/features/game/components/room/GameRightSidebar";
// hooks
import { useGame } from "@/features/game/hooks/useGame";
import { useGameSession } from "@/features/game/hooks/useGameSession";
import { useGameRealtime } from "@/features/game/hooks/useGameRealtime";
import { useBoardSelection } from "@/features/game/hooks/useBoardSelection";
import { useGameActions } from "@/features/game/hooks/useGameActions";
import { useGameClocks } from "@/features/game/hooks/useGameClocks";
import { useGameAutoJoin } from "@/features/game/hooks/useGameAutoJoin";
import {
  useGameSounds,
  type GameSoundName,
} from "@/features/game/sounds/GameSoundProvider";
import {
  ACTIVE_GAME_PRELOAD_SOUNDS,
  JOIN_PRELOAD_SOUNDS,
} from "@/features/game/sounds/gameSounds";

import {
  getEnPassantSquareFromFen,
  getCandidateSquares,
  getPieceAtSquare,
  isKingInCheck,
  pieceBelongsToColor,
  squareToCoords,
} from "@/utils/board/interactions";
import type { GameResponse, PieceColor, PromotionPiece } from "@/types/game";
import { getBoardPositionFromGameState } from "@/utils/board/position";
import type { BoardPiece } from "@/utils/board/position";

function getMoveSounds(
  previousGame: GameResponse | null,
  updatedGame: GameResponse,
  localColor?: PieceColor
): GameSoundName[] {
  const latestMove = updatedGame.moves[updatedGame.moves.length - 1];

  if (updatedGame.status === "completed") {
    return updatedGame.endReason === "checkmate"
      ? ["move-check", "game-end"]
      : ["game-end"];
  }

  const fallbackMoveSound =
    latestMove && localColor && latestMove.playerColor !== localColor
      ? "move-opponent"
      : "move-self";

  if (!previousGame || !latestMove) return [fallbackMoveSound];

  const previousPosition = getBoardPositionFromGameState(previousGame.currentFen);
  const updatedPosition = getBoardPositionFromGameState(updatedGame.currentFen);
  const movingPiece = getPieceAtSquare(previousPosition, latestMove.from);

  if (!movingPiece) return [fallbackMoveSound];

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

  if (isKingInCheck(updatedPosition, updatedGame.whoseTurn)) {
    return ["move-check"];
  }

  const isEnPassantCapture =
    movingPiece.type === "pawn" &&
    fromCoords.col !== toCoords.col &&
    !targetPiece &&
    getEnPassantSquareFromFen(previousGame.currentFen) === latestMove.to;

  const isCapture =
    (targetPiece && targetPiece.color !== movingPiece.color) || isEnPassantCapture;

  if (isCapture) return ["capture"];

  return [fallbackMoveSound];
}

function getOptimisticMoveSounds({
  currentFen,
  optimisticFen,
  from,
  to,
  promotion,
}: {
  currentFen?: string;
  optimisticFen: string;
  from: string;
  to: string;
  promotion?: PromotionPiece;
}): GameSoundName[] {
  if (!currentFen) return ["move-self"];

  const previousPosition = getBoardPositionFromGameState(currentFen);
  const updatedPosition = getBoardPositionFromGameState(optimisticFen);
  const movingPiece = getPieceAtSquare(previousPosition, from);

  if (!movingPiece) return ["move-self"];

  const fromCoords = squareToCoords(from);
  const toCoords = squareToCoords(to);
  const targetPiece = getPieceAtSquare(previousPosition, to);

  const isCastle =
    movingPiece.type === "king" && Math.abs(toCoords.col - fromCoords.col) === 2;

  if (isCastle) return ["castle"];

  const isPromotion =
    movingPiece.type === "pawn" && !!promotion && (to.endsWith("8") || to.endsWith("1"));

  if (isPromotion) return ["promote"];

  const checkedColor = movingPiece.color === "white" ? "black" : "white";

  if (isKingInCheck(updatedPosition, checkedColor)) {
    return ["move-check"];
  }

  const isEnPassantCapture =
    movingPiece.type === "pawn" &&
    fromCoords.col !== toCoords.col &&
    !targetPiece &&
    getEnPassantSquareFromFen(currentFen) === to;

  const isCapture =
    (targetPiece && targetPiece.color !== movingPiece.color) || isEnPassantCapture;

  return isCapture ? ["capture"] : ["move-self"];
}

function moveKey(from: string, to: string, color?: PieceColor) {
  return `${color ?? "unknown"}:${from}:${to}`;
}

export default function GameDetailsPage() {
  const params = useParams();
  const gameId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [optimisticFen, setOptimisticFen] = useState<string | null>(null);
  const [isEndModalDismissed, setIsEndModalDismissed] = useState(false);
  const [showStartOverlay, setShowStartOverlay] = useState(false);
  const [startOverlayKey, setStartOverlayKey] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pendingTapMoveFromRef = useRef<string | null>(null);
  const timeoutRefreshKeyRef = useRef<string | null>(null);
  const startOverlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPromptedJoinAuthRef = useRef(false);
  const optimisticSoundRef = useRef<{
    key: string;
    sounds: GameSoundName[];
  } | null>(null);

  const { game, setGame, isLoading, setError, refresh } = useGame(gameId);
  const { session, saveSession } = useGameSession(gameId);
  const localPlayerColor = session?.color;
  const { user, accessToken, isReady: isAuthReady, isAuthenticated } = useAuth();
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
  const currentTurnTimeRemainingMs =
    game?.whoseTurn === "white" ? whiteTimeRemainingMs : blackTimeRemainingMs;
  const timedOutColor =
    game?.status === "active" && currentTurnTimeRemainingMs <= 0 ? game.whoseTurn : null;

  const { playSound, playSounds, preloadSounds, prepareSounds, unlockSounds } =
    useGameSounds();

  const markStartOverlaySeen = useCallback((id: string) => {
    try {
      window.sessionStorage.setItem(`superchess.start-overlay.${id}`, "1");
    } catch {
      // Session storage can be unavailable in strict privacy modes.
    }
  }, []);

  const hasSeenStartOverlay = useCallback((id: string) => {
    try {
      return window.sessionStorage.getItem(`superchess.start-overlay.${id}`) === "1";
    } catch {
      return false;
    }
  }, []);

  const triggerStartOverlay = useCallback(() => {
    if (startOverlayTimeoutRef.current) {
      clearTimeout(startOverlayTimeoutRef.current);
    }

    setStartOverlayKey((key) => key + 1);
    setShowStartOverlay(true);
    startOverlayTimeoutRef.current = setTimeout(() => {
      setShowStartOverlay(false);
      startOverlayTimeoutRef.current = null;
    }, 1550);
  }, []);

  useEffect(() => {
    return () => {
      if (startOverlayTimeoutRef.current) {
        clearTimeout(startOverlayTimeoutRef.current);
      }
    };
  }, []);

  const handleIllegalMoveSound = useCallback(() => {
    optimisticSoundRef.current = null;
    playSound("illegal");
  }, [playSound]);
  const handleOptimisticMoveSound = useCallback(
    ({
      from,
      to,
      promotion,
      optimisticFen,
    }: {
      from: string;
      to: string;
      promotion?: PromotionPiece;
      optimisticFen: string;
    }) => {
      const sounds = getOptimisticMoveSounds({
        currentFen: game?.currentFen,
        optimisticFen,
        from,
        to,
        promotion,
      });

      optimisticSoundRef.current = {
        key: moveKey(from, to, localPlayerColor),
        sounds,
      };
      playSounds(sounds);
    },
    [game?.currentFen, localPlayerColor, playSounds]
  );

  const handleGameStartedSound = useCallback(() => {
    if (gameId) {
      markStartOverlaySeen(gameId);
    }

    triggerStartOverlay();
    void prepareSounds(["game-start"]).then(() => {
      playSound("game-start");
    });
  }, [gameId, markStartOverlaySeen, playSound, prepareSounds, triggerStartOverlay]);

  const handlePlayerJoined = useCallback(
    (updated: GameResponse) => {
      const startedGame = game?.status === "waiting" && updated.status === "active";

      setGame(updated);
      setOptimisticFen(null);

      if (startedGame) {
        markStartOverlaySeen(updated.id);
        triggerStartOverlay();
        playSound("game-start");
      }
    },
    [game?.status, markStartOverlaySeen, playSound, setGame, triggerStartOverlay]
  );

  const handleMovePlayed = useCallback(
    (updated: GameResponse) => {
      const latestMove = updated.moves[updated.moves.length - 1];
      const optimisticSound = optimisticSoundRef.current;
      const isOwnOptimisticConfirmation =
        !!latestMove &&
        !!localPlayerColor &&
        optimisticSound?.key ===
          moveKey(latestMove.from, latestMove.to, localPlayerColor);

      setGame(updated);
      setOptimisticFen(null);
      setSelectedSquare(null);

      if (isOwnOptimisticConfirmation) {
        optimisticSoundRef.current = null;

        if (updated.status === "completed") {
          const sounds =
            updated.endReason === "checkmate" &&
            !optimisticSound.sounds.includes("move-check")
              ? (["move-check", "game-end"] as GameSoundName[])
              : (["game-end"] as GameSoundName[]);

          playSounds(sounds, 280);
        }

        return;
      }

      const sounds = getMoveSounds(game, updated, localPlayerColor);
      playSounds(sounds);
    },
    [game, localPlayerColor, playSounds, setGame, setSelectedSquare]
  );

  const { isConnected } = useGameRealtime({
    gameId,
    onPlayerJoined: handlePlayerJoined,
    onMovePlayed: handleMovePlayed,
  });

  useEffect(() => {
    if (game?.status !== "active") return;

    const id = window.setTimeout(() => {
      preloadSounds(ACTIVE_GAME_PRELOAD_SOUNDS);
    }, 1000);

    return () => {
      window.clearTimeout(id);
    };
  }, [game?.status, preloadSounds]);

  const activeZeroMoveGameId =
    game?.status === "active" && game.moves.length === 0 ? game.id : null;

  useEffect(() => {
    if (!activeZeroMoveGameId) return;
    if (hasSeenStartOverlay(activeZeroMoveGameId)) return;

    markStartOverlaySeen(activeZeroMoveGameId);

    const id = window.setTimeout(() => {
      triggerStartOverlay();
    }, 0);

    return () => {
      window.clearTimeout(id);
    };
  }, [
    activeZeroMoveGameId,
    hasSeenStartOverlay,
    markStartOverlaySeen,
    triggerStartOverlay,
  ]);

  const {
    handleJoin,
    handleMoveAttempt,
    handlePromotionSelect,
    handlePromotionCancel,
    pendingPromotionMove,
    isJoining,
    isMakingMove,
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
    canSubmitMove: !timedOutColor,
    onIllegalMove: handleIllegalMoveSound,
    onOptimisticMove: handleOptimisticMoveSound,
    onGameStarted: handleGameStartedSound,
  });
  const pendingBotColor: PieceColor | null =
    isMakingMove && session
      ? session.color === "white"
        ? "black"
        : "white"
      : null;
  const pendingBotTurnStartedAt = useMemo(
    () => (pendingBotColor ? new Date().toISOString() : null),
    [pendingBotColor]
  );
  const pendingBotClockGame = useMemo(
    () =>
      game && pendingBotColor && pendingBotTurnStartedAt
        ? {
            ...game,
            whoseTurn: pendingBotColor,
            turnStartedAtUtc: pendingBotTurnStartedAt,
          }
        : null,
    [game, pendingBotColor, pendingBotTurnStartedAt]
  );
  const {
    whiteTimer: pendingWhiteTimer,
    blackTimer: pendingBlackTimer,
    whiteTimeRemainingMs: pendingWhiteTimeRemainingMs,
    blackTimeRemainingMs: pendingBlackTimeRemainingMs,
  } = useGameClocks(pendingBotClockGame);

  const handleJoinWithIdentity = useCallback(async () => {
    unlockSounds();

    if (!isAuthenticated || !user || !accessToken) {
      setError(null);
      setIsAuthModalOpen(true);
      return;
    }

    void prepareSounds(JOIN_PRELOAD_SOUNDS);
    await handleJoin();
  }, [
    accessToken,
    handleJoin,
    isAuthenticated,
    prepareSounds,
    setError,
    unlockSounds,
    user,
  ]);

  const handleAutoJoin = useCallback(() => handleJoin(), [handleJoin]);

  useGameAutoJoin({
    gameId,
    game,
    accessToken,
    isIdentityReady: isAuthReady,
    session,
    handleJoin: handleAutoJoin,
  });

  const handleAuthenticated = useCallback(() => {
    setIsAuthModalOpen(false);
    void prepareSounds(JOIN_PRELOAD_SOUNDS);
    void handleJoin();
  }, [handleJoin, prepareSounds]);

  const handleRefresh = useCallback(async () => {
    await refresh();
    setOptimisticFen(null);
    setSelectedSquare(null);
  }, [refresh, setSelectedSquare]);

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
      !!localPlayerColor &&
      pieceBelongsToColor(piece, localPlayerColor),
    [canMoveOwnPieces, localPlayerColor]
  );

  const handleBoardPiecePress = useCallback(
    (square: string, piece: BoardPiece) => {
      unlockSounds();

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
      unlockSounds,
    ]
  );

  const handleBoardTap = useCallback(
    async (square: string) => {
      unlockSounds();

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
      unlockSounds,
    ]
  );

  const handleBoardDragEnd = useCallback(
    async (from: string, releasedOn: string | null) => {
      unlockSounds();

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
      unlockSounds,
    ]
  );

  const canJoinAsBlack = !!game && !game.blackPlayer && game.status === "waiting";
  const canTakeBlackSeat = canJoinAsBlack && !session;

  useEffect(() => {
    if (
      !canTakeBlackSeat ||
      !isAuthReady ||
      isAuthenticated ||
      hasPromptedJoinAuthRef.current
    ) {
      return;
    }

    hasPromptedJoinAuthRef.current = true;
    setIsAuthModalOpen(true);
  }, [canTakeBlackSeat, isAuthReady, isAuthenticated]);

  const activeTurnColor = pendingBotColor ?? game?.whoseTurn;
  const isWhiteTurn = game?.status === "active" && activeTurnColor === "white";
  const isBlackTurn = game?.status === "active" && activeTurnColor === "black";
  const blackPlayerName = game?.blackPlayer?.displayName ?? "Waiting for player 2";
  const whitePlayerName = game?.whitePlayer.displayName ?? "Waiting for player 1";
  const boardPerspective = localPlayerColor ?? "white";
  const displayedWhiteTimer = pendingBotColor === "white" ? pendingWhiteTimer : whiteTimer;
  const displayedBlackTimer = pendingBotColor === "black" ? pendingBlackTimer : blackTimer;
  const displayedWhiteTimeRemainingMs =
    pendingBotColor === "white" ? pendingWhiteTimeRemainingMs : whiteTimeRemainingMs;
  const displayedBlackTimeRemainingMs =
    pendingBotColor === "black" ? pendingBlackTimeRemainingMs : blackTimeRemainingMs;

  const whitePlayerView = {
    name: whitePlayerName,
    color: "white" as const,
    timer: displayedWhiteTimer,
    timeRemainingMs: displayedWhiteTimeRemainingMs,
    isActive: isWhiteTurn,
    action: null,
  };

  const blackPlayerView = {
    name: blackPlayerName,
    color: "black" as const,
    timer: game?.blackPlayer ? displayedBlackTimer : "--:--",
    timeRemainingMs: game?.blackPlayer ? displayedBlackTimeRemainingMs : undefined,
    isActive: isBlackTurn,
    action:
      canTakeBlackSeat && isAuthReady ? (
        <button
          type="button"
          onClick={handleJoinWithIdentity}
          disabled={isJoining}
          className="rounded-md bg-primary-green px-3 py-1 text-[11px] font-semibold text-panel transition hover:bg-primary-green-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isJoining ? "Joining..." : "Join"}
        </button>
      ) : null,
  };

  const topPlayerView = boardPerspective === "white" ? blackPlayerView : whitePlayerView;

  const bottomPlayerView =
    boardPerspective === "white" ? whitePlayerView : blackPlayerView;

  if (isLoading) {
    return (
      <GameRoomShell
        table={
          <section className="flex h-full w-full items-center justify-center rounded-2xl border border-app-border bg-sidebar">
            <LoadingSpinner />
          </section>
        }
        sidebar={
          <GameRightSidebar
            game={game}
            gameId={gameId ?? ""}
            isConnected={isConnected}
            onRefresh={handleRefresh}
          />
        }
      />
    );
  }

  if (!game) {
    return (
      <GameRoomShell
        table={
          <section className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-sm text-red-200">
            Game not found.
          </section>
        }
        sidebar={
          <GameRightSidebar
            game={null}
            gameId={gameId ?? ""}
            isConnected={isConnected}
            onRefresh={handleRefresh}
          />
        }
      />
    );
  }

  return (
    <GameRoomShell
      table={
        <GameTable
          topPlayer={
            <GamePlayerBar
              name={topPlayerView.name}
              color={topPlayerView.color}
              timer={topPlayerView.timer}
              timeRemainingMs={topPlayerView.timeRemainingMs}
              isActive={topPlayerView.isActive}
              action={topPlayerView.action}
            />
          }
          board={
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
          }
          overlays={
            <>
              {showStartOverlay && (
                <GameStartOverlay
                  key={startOverlayKey}
                  whitePlayerName={whitePlayerName}
                  blackPlayerName={blackPlayerName}
                />
              )}

              {showEndModal && game && (
                <GameEndBanner
                  game={game}
                  timedOutColor={timedOutColor}
                  onDismiss={() => setIsEndModalDismissed(true)}
                />
              )}

              <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onAuthenticated={handleAuthenticated}
                reason="Sign in to join this SuperChess room."
              />

              {pendingPromotionMove && (
                <PromotionPicker
                  color={pendingPromotionMove.color}
                  onSelect={(promotion) => {
                    unlockSounds();
                    void handlePromotionSelect(promotion);
                  }}
                  onCancel={handlePromotionCancel}
                />
              )}
            </>
          }
          bottomPlayer={
            <GamePlayerBar
              name={bottomPlayerView.name}
              color={bottomPlayerView.color}
              timer={bottomPlayerView.timer}
              timeRemainingMs={bottomPlayerView.timeRemainingMs}
              isActive={bottomPlayerView.isActive}
              action={bottomPlayerView.action}
            />
          }
        />
      }
      sidebar={
        <GameRightSidebar
          game={game}
          gameId={gameId ?? ""}
          isConnected={isConnected}
          onRefresh={handleRefresh}
        />
      }
    />
  );
}
