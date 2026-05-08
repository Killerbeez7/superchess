import Image from "next/image";

import type { BoardPiece, BoardPosition } from "@/utils/board/position";

type ChessBoardPlaceholderProps = {
  variant?: "hero" | "app";
  position?: BoardPosition;
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

export function ChessBoardPlaceholder({
  variant = "app",
  position,
}: ChessBoardPlaceholderProps) {
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
            ? "aspect-square rounded-4xl border border-white/10 bg-slate-950/60 p-4 shadow-2xl sm:p-5"
            : "aspect-square rounded-[2.2rem] border border-white/10 bg-slate-950 p-4 shadow-2xl sm:p-5 lg:p-6"
        }
      >
        <div className="grid grid-cols-8 overflow-hidden rounded-2xl border border-white/10">
          {Array.from({ length: 64 }).map((_, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const isDark = (row + col) % 2 === 1;
            const square = getSquareKey(row, col);
            const piece = position?.[square];

            return (
              <div
                key={square}
                className={`relative aspect-square flex items-center justify-center ${
                  isDark ? "bg-slate-700" : "bg-slate-300"
                }`}
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

                {piece && (
                  <div className="relative h-[72%] w-[72%]">
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
      </div>
    </div>
  );
}
