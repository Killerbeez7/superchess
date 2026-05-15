import type { ReactNode } from "react";
import clsx from "clsx";

import type { PieceColor } from "@/types/game";

const timerStateClasses = {
  active: "bg-[#f5f5f4] text-[#1f1e1b] ring-1 ring-white/10",
  inactive: "bg-[#1f1e1b] text-[#b8b8b8] ring-1 ring-white/[0.08]",
  low: "bg-[#d97706] text-white ring-1 ring-orange-300/30",
  critical: "bg-[#b91c1c] text-white ring-1 ring-red-300/30",
  expired: "bg-[#3f1d1d] text-red-100 ring-1 ring-red-500/35",
};

type GamePlayerBarProps = {
  name: string;
  color: PieceColor;
  timer: string;
  timeRemainingMs?: number;
  isActive: boolean;
  action?: ReactNode;
};

function getTimerStateClass({
  isActive,
  timeRemainingMs,
}: {
  isActive: boolean;
  timeRemainingMs?: number;
}) {
  if (typeof timeRemainingMs === "number" && timeRemainingMs <= 0) {
    return timerStateClasses.expired;
  }

  if (typeof timeRemainingMs === "number" && timeRemainingMs <= 10_000) {
    return timerStateClasses.critical;
  }

  if (typeof timeRemainingMs === "number" && timeRemainingMs <= 30_000) {
    return timerStateClasses.low;
  }

  return isActive ? timerStateClasses.active : timerStateClasses.inactive;
}

export function GamePlayerBar({
  name,
  color,
  timer,
  timeRemainingMs,
  isActive,
  action,
}: GamePlayerBarProps) {
  const timerClassName = clsx(
    "box-border flex h-10 min-w-[88px] items-center justify-center rounded-sm px-3 text-center font-mono text-lg font-bold tabular-nums transition",
    getTimerStateClass({ isActive, timeRemainingMs })
  );

  return (
    <section className="flex h-12 w-full items-center justify-between gap-3 py-1">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={clsx(
            "grid h-8 w-8 shrink-0 place-items-center rounded-sm text-[11px] font-bold ring-1 ring-white/8",
            color === "white"
              ? "bg-[#f5f5f4] text-[#1f1e1b]"
              : "bg-[#1f1e1b] text-[#f5f5f4]"
          )}
        >
          {color === "white" ? "W" : "B"}
        </span>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-5 text-[#f5f5f4]">
            {name}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {action}
        <div className={timerClassName}>{timer}</div>
      </div>
    </section>
  );
}
