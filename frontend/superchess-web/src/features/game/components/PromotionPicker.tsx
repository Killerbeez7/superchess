"use client";

import Image from "next/image";
import type { PieceColor, PieceType, PromotionPiece } from "@/types/game";

type PromotionPickerProps = {
  color: PieceColor;
  onSelect: (piece: PromotionPiece) => void;
  onCancel: () => void;
};

const choices: Array<{
  value: PromotionPiece;
  label: string;
  type: PieceType;
}> = [
  { value: "q", label: "Queen", type: "queen" },
  { value: "r", label: "Rook", type: "rook" },
  { value: "b", label: "Bishop", type: "bishop" },
  { value: "n", label: "Knight", type: "knight" },
];

function getPieceSrc(color: PieceColor, type: PieceType) {
  const c = color === "white" ? "w" : "b";
  return `/pieces/${type}-${c}.svg`;
}

export function PromotionPicker({
  color,
  onSelect,
  onCancel,
}: PromotionPickerProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
      <div className="rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl">
        <p className="px-2 pb-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Promote pawn
        </p>
        <div className="grid grid-cols-4 gap-2">
          {choices.map((choice) => (
            <button
              key={choice.value}
              type="button"
              onClick={() => onSelect(choice.value)}
              className="group grid h-16 w-16 place-items-center rounded-xl border border-white/10 bg-slate-900 transition hover:border-white/30 hover:bg-slate-800"
              aria-label={`Promote to ${choice.label}`}
            >
              <span className="relative h-10 w-10 transition group-hover:scale-105">
                <Image
                  src={getPieceSrc(color, choice.type)}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-contain drop-shadow-[0_3px_8px_rgba(0,0,0,0.35)]"
                  draggable={false}
                />
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
