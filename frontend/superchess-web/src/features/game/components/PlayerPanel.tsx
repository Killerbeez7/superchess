import type { PieceColor } from "@/types/game";

type Props = {
  color: PieceColor;
  name: string;
  detail: string;
  isActive: boolean;
};

export function PlayerPanel({ color, name, detail, isActive }: Props) {
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
