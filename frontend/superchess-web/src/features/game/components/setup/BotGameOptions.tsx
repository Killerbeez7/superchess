"use client";

import clsx from "clsx";
import { FaChessPawn, FaChessQueen, FaGaugeHigh } from "react-icons/fa6";
import type { PieceColor } from "@/types/game";

export type BotLevel = 1 | 2 | 3;

type BotGameOptionsProps = {
  playerColor: PieceColor;
  botLevel: BotLevel;
  onPlayerColorChange: (color: PieceColor) => void;
  onBotLevelChange: (level: BotLevel) => void;
};

const colorOptions: Array<{
  color: PieceColor;
  title: string;
  description: string;
}> = [
  {
    color: "white",
    title: "White",
    description: "You move first",
  },
  {
    color: "black",
    title: "Black",
    description: "Bot moves first",
  },
];

const levelOptions: Array<{
  level: BotLevel;
  title: string;
  description: string;
}> = [
  {
    level: 1,
    title: "Level 1",
    description: "Tactical basics",
  },
  {
    level: 2,
    title: "Level 2",
    description: "Looks one reply ahead",
  },
  {
    level: 3,
    title: "Level 3",
    description: "Protects loose pieces",
  },
];

export function BotGameOptions({
  playerColor,
  botLevel,
  onPlayerColorChange,
  onBotLevelChange,
}: BotGameOptionsProps) {
  return (
    <section className="grid gap-3 rounded-xl border border-border-light bg-card-muted p-3">
      <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
        <FaGaugeHigh className="text-[13px]" />
        AI setup
      </div>

      <div className="grid gap-2">
        <p className="px-1 text-xs font-semibold text-text-muted">Play as</p>
        <div className="grid grid-cols-2 gap-2">
          {colorOptions.map((option) => {
            const isSelected = option.color === playerColor;

            return (
              <button
                key={option.color}
                type="button"
                onClick={() => onPlayerColorChange(option.color)}
                className={clsx(
                  "rounded-lg border px-3 py-2 text-left transition",
                  isSelected
                    ? "border-accent bg-accent text-text-inverse"
                    : "border-border-light bg-bg-muted text-text-primary hover:border-accent-soft hover:bg-card-hover"
                )}
              >
                <span className="flex items-center gap-2 text-sm font-bold">
                  {option.color === "white" ? <FaChessPawn /> : <FaChessQueen />}
                  {option.title}
                </span>
                <span
                  className={clsx(
                    "mt-0.5 block text-xs",
                    isSelected ? "text-text-inverse/75" : "text-text-muted"
                  )}
                >
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-2">
        <p className="px-1 text-xs font-semibold text-text-muted">Bot strength</p>
        <div className="grid gap-2">
          {levelOptions.map((option) => {
            const isSelected = option.level === botLevel;

            return (
              <button
                key={option.level}
                type="button"
                onClick={() => onBotLevelChange(option.level)}
                className={clsx(
                  "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition",
                  isSelected
                    ? "border-accent bg-accent text-text-inverse"
                    : "border-border-light bg-bg-muted text-text-primary hover:border-accent-soft hover:bg-card-hover"
                )}
              >
                <span>
                  <span className="block text-sm font-bold">{option.title}</span>
                  <span
                    className={clsx(
                      "mt-0.5 block text-xs",
                      isSelected ? "text-text-inverse/75" : "text-text-muted"
                    )}
                  >
                    {option.description}
                  </span>
                </span>

                {isSelected ? (
                  <span className="rounded-full bg-text-inverse/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">
                    Selected
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
