"use client";

import Image from "next/image";

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
};

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
}: ChessBoardProps) {
  const isHero = variant === "hero";

  return (
    <div
      className={
        isHero
          ? "mx-auto w-full max-w-[560px]"
          : "mx-auto w-full max-w-[min(82vw,78dvh,820px)]"
      }
    >
      <div
        className={
          isHero
            ? "aspect-square rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-2xl sm:p-5"
            : "aspect-square rounded-[1.2rem] border border-white/10 bg-slate-950 p-4 shadow-2xl sm:p-5 lg:p-6"
          // : ""
        }
      >
        <div className="grid grid-cols-8 overflow-hidden rounded-xl border border-white/10">
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

            return (
              <button
                key={square}
                type="button"
                onClick={() => onSquareClick?.(square)}
                disabled={!interactive}
                aria-label={`Square ${square}`}
                className={`relative flex aspect-square items-center justify-center ${
                  isDark ? "bg-slate-700" : "bg-slate-300"
                } ${interactive ? "cursor-pointer" : "cursor-default"} ${
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
                  <div className="pointer-events-none relative h-[72%] w-[72%]">
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
      </div>
    </div>
  );
}
