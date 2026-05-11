"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { PointerEvent } from "react";

import type { BoardPiece, BoardPosition } from "@/utils/board/position";

type ChessBoardProps = {
  variant?: "hero" | "app";
  position?: BoardPosition;
  interactive?: boolean;
  selectedSquare?: string | null;
  candidateSquares?: string[];
  lastMoveFrom?: string | null;
  lastMoveTo?: string | null;
  onSquareClick?: (square: string) => void;
  onMoveAttempt?: (from: string, to: string) => void | Promise<void>;
  onSelectionClear?: () => void;
  onVisualSelect?: (square: string) => void;
  draggableColor?: BoardPiece["color"] | null;
  allowPieceDrag?: boolean;
};

type DragStart = {
  from: string;
  piece: BoardPiece;
  canMove: boolean;
  x: number;
  y: number;
  size: number;
  pointerId: number;
};

type DragState = DragStart;

const files = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

function getPieceSrc(piece: BoardPiece) {
  const colorSuffix = piece.color === "white" ? "w" : "b";
  return `/pieces/${piece.type}-${colorSuffix}.svg`;
}

function getSquareKey(row: number, col: number) {
  const file = files[col];
  const rank = 8 - row;
  return `${file}${rank}`;
}

export function ChessBoard({
  variant = "app",
  position,
  interactive = false,
  selectedSquare = null,
  candidateSquares = [],
  lastMoveFrom = null,
  lastMoveTo = null,
  onSquareClick,
  onMoveAttempt,
  onSelectionClear,
  onVisualSelect,
  draggableColor = null,
  allowPieceDrag = false,
}: ChessBoardProps) {
  const isHero = variant === "hero";
  const boardRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<DragStart | null>(null);
  const suppressClickRef = useRef(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const selectedPiece = selectedSquare ? position?.[selectedSquare] ?? null : null;
  const hasMovableSelection =
    interactive &&
    !!selectedPiece &&
    (!draggableColor || selectedPiece.color === draggableColor);

  function getSquareFromPoint(clientX: number, clientY: number) {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const col = Math.floor(((clientX - rect.left) / rect.width) * 8);
    const row = Math.floor(((clientY - rect.top) / rect.height) * 8);

    if (row < 0 || row > 7 || col < 0 || col > 7) return null;

    return getSquareKey(row, col);
  }

  function clearDrag() {
    dragStartRef.current = null;
    setDrag(null);
  }

  function handlePointerDown(
    event: PointerEvent<HTMLButtonElement>,
    square: string,
    piece: BoardPiece | null
  ) {
    if (!piece || !onMoveAttempt) return;
    if (!interactive && !allowPieceDrag) return;

    const squareSize = event.currentTarget.getBoundingClientRect().width;
    const canMove =
      interactive && (!draggableColor || piece.color === draggableColor);
    const shouldLetClickAttemptMove =
      !canMove && hasMovableSelection && selectedSquare !== square;

    dragStartRef.current = {
      from: square,
      piece,
      canMove,
      x: event.clientX,
      y: event.clientY,
      size: squareSize * 0.72,
      pointerId: event.pointerId,
    };

    setDrag(dragStartRef.current);
    suppressClickRef.current =
      selectedSquare !== square && !shouldLetClickAttemptMove;

    if (selectedSquare !== square) {
      if (canMove) {
        onSquareClick?.(square);
      } else if (!shouldLetClickAttemptMove) {
        onVisualSelect?.(square);
      }
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const start = dragStartRef.current;
    if (!start) return;

    setDrag({
      ...start,
      x: event.clientX,
      y: event.clientY,
    });
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    const start = dragStartRef.current;
    if (!start) return;

    const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    const didDrag = distance >= 4;

    if (event.currentTarget.hasPointerCapture(start.pointerId)) {
      event.currentTarget.releasePointerCapture(start.pointerId);
    }

    if (didDrag) {
      const targetSquare = getSquareFromPoint(event.clientX, event.clientY);
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);

      if (start.canMove && targetSquare && targetSquare !== start.from) {
        void onMoveAttempt?.(start.from, targetSquare);
      } else if (start.canMove) {
        onSelectionClear?.();
      }
    } else {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    clearDrag();
  }

  function handlePointerCancel(event: PointerEvent<HTMLButtonElement>) {
    const start = dragStartRef.current;

    if (start && event.currentTarget.hasPointerCapture(start.pointerId)) {
      event.currentTarget.releasePointerCapture(start.pointerId);
    }

    if (drag) {
      onSelectionClear?.();
    }

    clearDrag();
  }

  return (
    <div
      className={
        isHero
          ? "mx-auto w-full max-w-[560px]"
          : "mx-auto w-full max-w-[min(98vw,82dvh,820px)] lg:max-w-[min(92vw,78dvh,820px)]"
      }
    >
      <div
        className={
          isHero
            ? "aspect-square rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-2xl sm:p-5"
            : "aspect-square rounded-[1.2rem] border border-white/10 bg-slate-950 p-1.5 shadow-2xl sm:p-5 lg:p-6"
          // : ""
        }
      >
        <div
          ref={boardRef}
          className="grid touch-none select-none grid-cols-8 overflow-hidden rounded-xl border border-white/10"
        >
          {Array.from({ length: 64 }).map((_, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const isDark = (row + col) % 2 === 1;
            const square = getSquareKey(row, col);
            const piece = position?.[square] ?? null;

            const isSelected = selectedSquare === square;
            const isCandidate = candidateSquares.includes(square);
            const isLastMove = square === lastMoveFrom || square === lastMoveTo;
            const isCaptureCandidate = isCandidate && !!piece;
            const isDraggingSource = drag?.from === square;

            return (
              <button
                key={square}
                type="button"
                onClick={() => {
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false;
                    return;
                  }

                  const piece = position?.[square] ?? null;
                  const canMove =
                    interactive &&
                    !!piece &&
                    (!draggableColor || piece.color === draggableColor);

                  if (piece && !canMove) {
                    if (hasMovableSelection && selectedSquare !== square) {
                      onSquareClick?.(square);
                      return;
                    }

                    if (selectedSquare === square) {
                      onSelectionClear?.();
                    } else {
                      onVisualSelect?.(square);
                    }

                    return;
                  }

                  onSquareClick?.(square);
                }}
                onPointerDown={(event) => handlePointerDown(event, square, piece)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                disabled={!interactive && !(allowPieceDrag && piece)}
                aria-label={`Square ${square}`}
                style={{
                  cursor:
                    (interactive || allowPieceDrag) && piece
                      ? isDraggingSource
                        ? "grabbing"
                        : "grab"
                      : "default",
                }}
                className={`relative flex aspect-square items-center justify-center ${
                  isDark ? "bg-slate-700" : "bg-slate-300"
                } ${
                  isLastMove ? "shadow-[inset_0_0_0_9999px_rgba(250,204,21,0.14)]" : ""
                } ${isSelected ? "z-10 ring-2 ring-inset ring-emerald-400" : ""}`}
              >
                {col === 0 && (
                  <span className="pointer-events-none absolute left-1.5 top-1.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500/70 sm:left-2 sm:top-2 sm:text-[10px]">
                    {8 - row}
                  </span>
                )}

                {row === 7 && (
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500/70 sm:bottom-2 sm:right-2 sm:text-[10px]">
                    {String.fromCharCode(97 + col)}
                  </span>
                )}

                {isCandidate && !isCaptureCandidate && (
                  <span className="pointer-events-none absolute h-3 w-3 rounded-full bg-white/45" />
                )}

                {isCaptureCandidate && (
                  <span className="pointer-events-none absolute inset-[10%] rounded-full ring-2 ring-white/35" />
                )}

                {piece && (
                  <div
                    className={`pointer-events-none relative h-[72%] w-[72%] ${
                      isDraggingSource ? "opacity-0" : ""
                    }`}
                  >
                    <Image
                      src={getPieceSrc(piece)}
                      alt={`${piece.color} ${piece.type}`}
                      fill
                      sizes="(max-width: 768px) 10vw, 72px"
                      className="object-contain drop-shadow-[0_3px_8px_rgba(0,0,0,0.35)]"
                      draggable={false}
                      priority={row <= 1 || row >= 6}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {drag && (
          <div
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2"
            style={{
              height: drag.size,
              left: drag.x,
              top: drag.y,
              width: drag.size,
            }}
          >
            <Image
              src={getPieceSrc(drag.piece)}
              alt={`${drag.piece.color} ${drag.piece.type}`}
              fill
              sizes={`${Math.ceil(drag.size)}px`}
              className="object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
              draggable={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
