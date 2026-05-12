"use client";

import Image from "next/image";
import type { BoardPiece, BoardPosition } from "@/utils/board/position";
import { usePieceDrag } from "@/features/game/hooks/usePieceDrag";

type ChessBoardProps = {
  variant?: "hero" | "app";
  position?: BoardPosition;
  interactive?: boolean;
  selectedSquare?: string | null;
  candidateSquares?: string[];
  lastMoveFrom?: string | null;
  lastMoveTo?: string | null;
  onSquareTap?: (square: string) => void;
  onPiecePress?: (square: string, piece: BoardPiece) => boolean | void;
  onDragEnd?: (from: string, releasedOn: string | null) => void;
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

function getPieceSrc(piece: BoardPiece) {
  const c = piece.color === "white" ? "w" : "b";
  return `/pieces/${piece.type}-${c}.svg`;
}

function getSquareKey(row: number, col: number) {
  return `${FILES[col]}${8 - row}`;
}

export function ChessBoard({
  variant = "app",
  position,
  selectedSquare = null,
  candidateSquares = [],
  lastMoveFrom = null,
  lastMoveTo = null,
  onSquareTap,
  onPiecePress,
  onDragEnd,
}: ChessBoardProps) {
  const isHero = variant === "hero";

  const { boardRef, pointerHandlers, dragOverlay, draggingFrom, hoveredSquare } =
    usePieceDrag({
      enabled: !!onSquareTap || !!onPiecePress || !!onDragEnd,
      position,
      onPiecePress,
      onTap: (square) => onSquareTap?.(square),
      onDragEnd,
    });

  return (
    <div
      className={
        isHero
          ? "mx-auto w-full max-w-[560px] touch-none"
          : "mx-auto w-full max-w-[min(92vw,78dvh,820px)] touch-none"
      }
    >
      <div
        className={
          isHero
            ? "aspect-square rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-2xl sm:p-5"
            : "aspect-square rounded-[1.2rem] border border-white/10 bg-slate-950 p-1.5 shadow-2xl sm:p-5 lg:p-6"
        }
      >
        <div
          ref={boardRef}
          {...pointerHandlers}
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
            const isDraggingSource = draggingFrom === square;
            const isHoveredDrop = hoveredSquare === square;

            return (
              <div
                key={square}
                aria-label={`Square ${square}`}
                style={{
                  cursor: piece ? (isDraggingSource ? "grabbing" : "grab") : "default",
                }}
                className={`relative flex aspect-square items-center justify-center ${
                  isDark ? "bg-slate-700" : "bg-slate-300"
                }`}
              >
                {isLastMove && (
                  <span className="pointer-events-none absolute inset-0 bg-emerald-400/15" />
                )}

                {isSelected && (
                  <span className="pointer-events-none absolute inset-0 bg-emerald-400/25" />
                )}

                {isHoveredDrop && (
                  <span className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-white/80" />
                )}

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
              </div>
            );
          })}
        </div>

        {dragOverlay && (
          <div
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2"
            style={{
              height: dragOverlay.size,
              left: dragOverlay.x,
              top: dragOverlay.y,
              width: dragOverlay.size,
            }}
          >
            <Image
              src={getPieceSrc(dragOverlay.piece)}
              alt=""
              fill
              sizes={`${Math.ceil(dragOverlay.size)}px`}
              className="object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
              draggable={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
