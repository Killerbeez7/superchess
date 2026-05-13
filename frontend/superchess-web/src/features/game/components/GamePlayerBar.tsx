import type { ReactNode } from "react";
import clsx from "clsx";

import type { PieceColor } from "@/types/game";

type GamePlayerBarProps = {
  name: string;
  color: PieceColor;
  timer: string;
  timeRemainingMs?: number;
  isActive: boolean;
  action?: ReactNode;
};

export function GamePlayerBar({
  name,
  color,
  timer,
  timeRemainingMs,
  isActive,
  action,
}: GamePlayerBarProps) {
  const isExpired = typeof timeRemainingMs === "number" && timeRemainingMs <= 0;
  const isLowTime =
    typeof timeRemainingMs === "number" && timeRemainingMs > 0 && timeRemainingMs <= 30_000;
  const timerClassName = clsx(
    "box-border flex h-8 min-w-16 items-center justify-center rounded-md border px-2.5 text-center font-mono text-base font-bold tabular-nums transition",
    isExpired
      ? "border-red-400/30 bg-red-500/15 text-red-200"
      : isLowTime
        ? "border-red-400/30 bg-red-400/10 text-red-200"
        : isActive
          ? "border-transparent bg-slate-100 text-slate-950 shadow-[0_0_18px_rgba(226,232,240,0.18)]"
          : "border-white/10 bg-transparent text-slate-600"
  );

  return (
    <section className="flex min-h-10 items-center justify-between gap-3 px-1 py-1">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border text-[10px] font-bold ${
            color === "white"
              ? "border-slate-300/70 bg-slate-100 text-slate-950"
              : "border-slate-700 bg-slate-950/80 text-slate-200"
          }`}
        >
          {color === "white" ? "W" : "B"}
        </span>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-5 text-white">{name}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {action}
        <div className={timerClassName}>
          {timer}
        </div>
      </div>
    </section>
  );
}
