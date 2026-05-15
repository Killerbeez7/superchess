import type { MoveSummary } from "@/types/game";

type MoveHistoryRowProps = {
  index: number;
  moveNumber: number;
  whiteMove: MoveSummary | null;
  blackMove: MoveSummary | null;
};

function formatMove(move: MoveSummary | null) {
  if (!move) return "";
  return `${move.from} -> ${move.to}`;
}

export function MoveHistoryRow({
  index,
  moveNumber,
  whiteMove,
  blackMove,
}: MoveHistoryRowProps) {
  return (
    <div
      className={`grid grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1fr)] items-center text-[13px] ${
        index % 2 === 0 ? "bg-white/4.5" : "bg-black/10"
      }`}
    >
      <span className="px-2 py-2 text-center text-xs font-semibold text-[#b8b8b8]">
        {moveNumber}.
      </span>
      <span className="truncate border-l border-white/8 px-2 py-2 font-mono text-white">
        {formatMove(whiteMove)}
      </span>
      <span className="truncate border-l border-white/8 px-2 py-2 font-mono text-white">
        {formatMove(blackMove)}
      </span>
    </div>
  );
}
