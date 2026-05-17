"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  FaBolt,
  FaChevronDown,
  FaChessKing,
  FaClock,
  FaRocket,
  FaShieldHalved,
  FaStopwatch,
} from "react-icons/fa6";

export type TimeControlCategory = "bullet" | "blitz" | "rapid";

export type TimeControl = {
  id: string;
  label: string;
  minutes: number;
  incrementSeconds: number;
  category: TimeControlCategory;
};

type TimeControlGroup = {
  id: TimeControlCategory;
  label: string;
  icon: ReactNode;
  options: TimeControl[];
};

type GameModeOption = {
  id: string;
  label: string;
  description: string;
  isAvailable: boolean;
  icon: ReactNode;
};

export const TIME_CONTROL_GROUPS: TimeControlGroup[] = [
  {
    id: "bullet",
    label: "Bullet",
    icon: <FaRocket />,
    options: [
      { id: "1+0", label: "1 min", minutes: 1, incrementSeconds: 0, category: "bullet" },
      { id: "1+1", label: "1 | 1", minutes: 1, incrementSeconds: 1, category: "bullet" },
      { id: "2+1", label: "2 | 1", minutes: 2, incrementSeconds: 1, category: "bullet" },
    ],
  },
  {
    id: "blitz",
    label: "Blitz",
    icon: <FaBolt />,
    options: [
      { id: "3+0", label: "3 min", minutes: 3, incrementSeconds: 0, category: "blitz" },
      { id: "3+2", label: "3 | 2", minutes: 3, incrementSeconds: 2, category: "blitz" },
      { id: "5+0", label: "5 min", minutes: 5, incrementSeconds: 0, category: "blitz" },
    ],
  },
  {
    id: "rapid",
    label: "Rapid",
    icon: <FaStopwatch />,
    options: [
      {
        id: "10+0",
        label: "10 min",
        minutes: 10,
        incrementSeconds: 0,
        category: "rapid",
      },
      {
        id: "15+10",
        label: "15 | 10",
        minutes: 15,
        incrementSeconds: 10,
        category: "rapid",
      },
      {
        id: "30+0",
        label: "30 min",
        minutes: 30,
        incrementSeconds: 0,
        category: "rapid",
      },
    ],
  },
];

const TIME_CONTROLS = TIME_CONTROL_GROUPS.flatMap((group) => group.options);

const GAME_MODE_OPTIONS: GameModeOption[] = [
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

export const DEFAULT_TIME_CONTROL =
  TIME_CONTROLS.find((timeControl) => timeControl.id === "5+0") ?? TIME_CONTROLS[0];

type TimeControlPickerProps = {
  selectedId: string;
  onChange: (timeControl: TimeControl) => void;
};

function getGroup(timeControl: TimeControl) {
  return (
    TIME_CONTROL_GROUPS.find((group) => group.id === timeControl.category) ??
    TIME_CONTROL_GROUPS[0]
  );
}

export function TimeControlPicker({ selectedId, onChange }: TimeControlPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedTimeControl = useMemo(
    () =>
      TIME_CONTROLS.find((timeControl) => timeControl.id === selectedId) ??
      DEFAULT_TIME_CONTROL,
    [selectedId]
  );
  const selectedGroup = getGroup(selectedTimeControl);
  const selectedMode = GAME_MODE_OPTIONS.find((mode) => mode.id === "classical")!;

  function handleSelect(timeControl: TimeControl) {
    onChange(timeControl);
    setIsExpanded(false);
  }

  return (
    <div className="shrink-0 overflow-hidden rounded-xl border border-border-light bg-card-muted">
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        aria-expanded={isExpanded}
        className={clsx(
          "flex min-h-[52px] w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-card-hover",
          isExpanded ? "rounded-t-xl" : "rounded-xl"
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-icon-muted text-[15px]">
            {selectedGroup.icon}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-text-primary">
              {selectedTimeControl.label} (Unrated)
            </span>
            <span className="mt-0.5 block truncate text-xs text-text-muted">
              {selectedMode.label}
            </span>
          </span>
        </span>

        <FaChevronDown
          className={clsx(
            "shrink-0 text-sm text-text-muted transition",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {isExpanded && (
        <div className="rounded-b-xl border-t border-border-light bg-bg-muted p-3">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-border-light bg-card-muted px-3 py-2.5">
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

          <div className="grid gap-4">
            {TIME_CONTROL_GROUPS.map((group) => (
              <section key={group.id} className="grid gap-2">
                <h3 className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
                  <span className="text-[13px]">{group.icon}</span>
                  {group.label}
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  {group.options.map((timeControl) => {
                    const isSelected = timeControl.id === selectedId;

                    return (
                      <button
                        key={timeControl.id}
                        type="button"
                        onClick={() => handleSelect(timeControl)}
                        className={clsx(
                          "h-10 rounded-lg border px-2 text-sm font-bold transition",
                          isSelected
                            ? "border-accent bg-accent text-text-inverse"
                            : "border-border-light bg-bg-muted text-text-primary hover:border-accent-soft hover:bg-card-hover"
                        )}
                      >
                        {timeControl.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-4 grid gap-2">
            <h3 className="px-1 text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
              Mode
            </h3>

            <div className="grid gap-2">
              {GAME_MODE_OPTIONS.map((mode) => {
                const isSelected = mode.id === "classical";

                return (
                  <button
                    key={mode.id}
                    type="button"
                    disabled={!mode.isAvailable}
                    className={clsx(
                      "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition",
                      isSelected
                        ? "border-accent bg-accent text-text-inverse"
                        : "border-border-light bg-card-muted text-text-primary",
                      !mode.isAvailable &&
                        "cursor-not-allowed opacity-55 hover:border-border-light hover:bg-card-muted"
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">
                        {mode.label}
                      </span>
                      <span
                        className={clsx(
                          "mt-0.5 block truncate text-xs",
                          isSelected ? "text-text-inverse/75" : "text-text-muted"
                        )}
                      >
                        {mode.description}
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
        </div>
      )}
    </div>
  );
}
