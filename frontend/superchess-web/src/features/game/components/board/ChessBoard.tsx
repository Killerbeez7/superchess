"use client";

import Image from "next/image";
import type { BoardPiece, BoardPosition } from "@/utils/board/position";
import { usePieceDrag } from "@/features/game/hooks/usePieceDrag";

export type BoardPerspective = "white" | "black";

type ChessBoardProps = {
  variant?: "hero" | "app";
  position?: BoardPosition;
  perspective?: BoardPerspective;
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

function getSquareKey(row: number, col: number, perspective: BoardPerspective) {
  const boardCol = perspective === "white" ? col : 7 - col;
  const boardRow = perspective === "white" ? row : 7 - row;

  return `${FILES[boardCol]}${8 - boardRow}`;
}

export function ChessBoard({
  variant = "app",
  perspective = "white",
  position,
  interactive = false,
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
      enabled: interactive && (!!onSquareTap || !!onPiecePress || !!onDragEnd),
      perspective,
      position,
      onPiecePress,
      onTap: (square) => onSquareTap?.(square),
      onDragEnd,
    });

  return (
    <div className="h-full w-full touch-none select-none">
      <div
        className={
          isHero
            ? "aspect-square rounded-2xl border border-app-border bg-panel p-4 shadow-2xl sm:p-5"
            : // : "h-full w-full rounded-xl bg-panel p-1.5 shadow-2xl sm:p-2"
              "h-full w-full rounded-xl shadow-2xl"
        }
      >
        <div
          ref={boardRef}
          {...pointerHandlers}
          // className="grid touch-none select-none grid-cols-8 overflow-hidden rounded-xl border border-white/10"
          className="grid touch-none select-none grid-cols-8 overflow-hidden rounded-sm border border-white/10"
          style={{
            touchAction: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
          }}
        >
          {Array.from({ length: 64 }).map((_, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const isDark = (row + col) % 2 === 1;
            const square = getSquareKey(row, col, perspective);
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
                  isDark ? "bg-board-dark" : "bg-board-light"
                }`}
              >
                {isLastMove && (
                  <span className="pointer-events-none absolute inset-0 bg-board-last-move" />
                )}

                {isSelected && (
                  <span className="pointer-events-none absolute inset-0 bg-board-selected" />
                )}

                {isHoveredDrop && (
                  <span className="pointer-events-none absolute inset-0 ring-5 ring-inset ring-white/70" />
                )}

                {col === 0 && (
                  <span className="pointer-events-none absolute left-1.5 top-1.5 text-[9px] font-semibold uppercase tracking-wide text-board-coordinate sm:left-2 sm:top-2 sm:text-[10px]">
                    {perspective === "white" ? 8 - row : row + 1}
                  </span>
                )}

                {row === 7 && (
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 text-[9px] font-semibold uppercase tracking-wide text-board-coordinate sm:bottom-2 sm:right-2 sm:text-[10px]">
                    {perspective === "white" ? FILES[col] : FILES[7 - col]}
                  </span>
                )}

                {isCandidate && !isCaptureCandidate && (
                  <span className="pointer-events-none absolute h-3 w-3 rounded-full bg-board-candidate" />
                )}

                {isCaptureCandidate && (
                  <span className="pointer-events-none absolute inset-[10%] rounded-full ring-2 ring-board-capture" />
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
