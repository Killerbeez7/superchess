import Image from "next/image";

type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
type PieceColor = "white" | "black";

type Piece = {
  type: PieceType;
  color: PieceColor;
};

const backRank: PieceType[] = [
  "rook",
  "knight",
  "bishop",
  "queen",
  "king",
  "bishop",
  "knight",
  "rook",
];

function getPiece(row: number, col: number): Piece | null {
  if (row === 0) return { type: backRank[col], color: "black" };
  if (row === 1) return { type: "pawn", color: "black" };
  if (row === 6) return { type: "pawn", color: "white" };
  if (row === 7) return { type: backRank[col], color: "white" };

  return null;
}

function getPieceSrc(piece: Piece) {
  const colorSuffix = piece.color === "white" ? "w" : "b";
  return `/pieces/${piece.type}-${colorSuffix}.svg`;
}

export function ChessBoardPlaceholder() {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl backdrop-blur">
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="mx-auto w-full max-w-[min(82vw,78dvh)]">
          <div className="aspect-square rounded-4xl border border-white/10 bg-slate-900/70 p-4 sm:p-5">
            <div className="grid grid-cols-8 overflow-hidden rounded-2xl border border-white/10">
              {Array.from({ length: 64 }).map((_, index) => {
                const row = Math.floor(index / 8);
                const col = index % 8;
                const isDark = (row + col) % 2 === 1;
                const piece = getPiece(row, col);

                return (
                  <div
                    key={index}
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
      </div>
    </section>
  );
}
