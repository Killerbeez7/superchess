import type { MoveSummary } from "@/types/game";

import { MoveHistoryRow } from "./MoveHistoryRow";

type MoveHistoryProps = {
  moves: MoveSummary[];
};

type PairedMoveRow = {
  moveNumber: number;
  whiteMove: MoveSummary | null;
  blackMove: MoveSummary | null;
};

function buildRows(moves: MoveSummary[]): PairedMoveRow[] {
  const rows: PairedMoveRow[] = [];

  moves.forEach((move, index) => {
    const rowIndex = Math.floor(index / 2);

    rows[rowIndex] ??= {
      moveNumber: rowIndex + 1,
      whiteMove: null,
      blackMove: null,
    };

    if (move.playerColor === "white") {
      rows[rowIndex].whiteMove = move;
      return;
    }

    rows[rowIndex].blackMove = move;
  });

  return rows;
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  if (moves.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/8 bg-[#24231f] p-4 text-sm text-[#b8b8b8]">
        No moves yet.
      </div>
    );
  }

  const rows = buildRows(moves);

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-[#24231f]">
      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1fr)] border-b border-white/8 bg-[#211f1c] text-[11px] font-bold uppercase tracking-[0.12em] text-[#b8b8b8]">
        <span className="px-2 py-2 text-center">#</span>
        <span className="border-l border-white/8 px-2 py-2">White</span>
        <span className="border-l border-white/8 px-2 py-2">Black</span>
      </div>

      {rows.map((row, index) => (
        <MoveHistoryRow
          key={row.moveNumber}
          index={index}
          moveNumber={row.moveNumber}
          whiteMove={row.whiteMove}
          blackMove={row.blackMove}
        />
      ))}
    </div>
  );
}
