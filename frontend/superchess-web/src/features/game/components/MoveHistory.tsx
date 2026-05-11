import type { MoveSummary } from "@/types/game";

type Props = { moves: MoveSummary[] };

export function MoveHistory({ moves }: Props) {
  if (moves.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-3.5 text-[13px] text-slate-500">
        No moves yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {moves.map((move) => (
        <div
          key={move.moveNumber}
          className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/75 px-3 py-2 text-sm"
        >
          <span className="min-w-8 text-xs text-slate-500">{move.moveNumber}.</span>
          <span className="flex-1 text-slate-200">
            {move.playerColor === "white" ? "W" : "B"} {move.from} → {move.to}
          </span>
        </div>
      ))}
    </div>
  );
}
