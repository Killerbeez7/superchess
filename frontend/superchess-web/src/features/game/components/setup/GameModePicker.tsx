"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { FaChessKing, FaClock, FaShieldHalved } from "react-icons/fa6";

export type GameModeId = "classical" | "battlegrounds" | "special-event";

export type GameMode = {
  id: GameModeId;
  label: string;
  description: string;
  isAvailable: boolean;
  icon: ReactNode;
};

export const GAME_MODE_OPTIONS: GameMode[] = [
  {
    id: "classical",
    label: "Classical",
    description: "Standard chess rules",
    isAvailable: true,
    icon: <FaChessKing />,
  },
  {
    id: "battlegrounds",
    label: "Battlegrounds",
    description: "SuperChess arena mode",
    isAvailable: false,
    icon: <FaShieldHalved />,
  },
  {
    id: "special-event",
    label: "Special Event",
    description: "Limited-time rulesets",
    isAvailable: false,
    icon: <FaClock />,
  },
];

export const DEFAULT_GAME_MODE =
  GAME_MODE_OPTIONS.find((mode) => mode.id === "classical") ?? GAME_MODE_OPTIONS[0];

type GameModePickerProps = {
  selectedId: GameModeId;
  onChange: (mode: GameMode) => void;
};

export function GameModePicker({ selectedId, onChange }: GameModePickerProps) {
  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border-light bg-card-muted px-3 py-2.5">
        <div>
          <p className="text-sm font-bold text-text-primary">Rated</p>
          <p className="mt-0.5 text-xs text-text-muted">Requires accounts</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted">Soon</span>
          <button
            type="button"
            disabled
            aria-label="Rated games coming soon"
            className="relative h-6 w-11 cursor-not-allowed rounded-full border border-border-light bg-bg-muted opacity-70"
          >
            <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-text-subtle" />
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        <h3 className="px-1 text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
          Mode
        </h3>

        {GAME_MODE_OPTIONS.map((mode) => {
          const isSelected = mode.id === selectedId;

          return (
            <button
              key={mode.id}
              type="button"
              disabled={!mode.isAvailable}
              onClick={() => onChange(mode)}
              className={clsx(
                "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition",
                isSelected
                  ? "border-accent bg-accent text-text-inverse"
                  : "border-border-light bg-card-muted text-text-primary hover:border-border-medium hover:bg-card-hover",
                !mode.isAvailable &&
                  "cursor-not-allowed opacity-55 hover:border-border-light hover:bg-card-muted"
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={clsx(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                    isSelected ? "bg-text-inverse/10" : "bg-icon-muted"
                  )}
                >
                  {mode.icon}
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{mode.label}</span>
                  <span
                    className={clsx(
                      "mt-0.5 block truncate text-xs",
                      isSelected ? "text-text-inverse/75" : "text-text-muted"
                    )}
                  >
                    {mode.description}
                  </span>
                </span>
              </span>

              <span
                className={clsx(
                  "shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                  isSelected
                    ? "bg-text-inverse/10 text-text-inverse"
                    : "bg-bg-muted text-text-muted"
                )}
              >
                {isSelected ? "Selected" : "Soon"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
