"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { FaBolt, FaRocket, FaStopwatch } from "react-icons/fa6";

export type TimeControlCategory = "bullet" | "blitz" | "rapid";

export type TimeControl = {
  id: string;
  label: string;
  minutes: number;
  incrementSeconds: number;
  category: TimeControlCategory;
};

export type TimeControlGroup = {
  id: TimeControlCategory;
  label: string;
  icon: ReactNode;
  options: TimeControl[];
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

export const TIME_CONTROLS = TIME_CONTROL_GROUPS.flatMap((group) => group.options);

export const DEFAULT_TIME_CONTROL =
  TIME_CONTROLS.find((timeControl) => timeControl.id === "5+0") ?? TIME_CONTROLS[0];

export function findTimeControl(timeControlId: string) {
  return (
    TIME_CONTROLS.find((timeControl) => timeControl.id === timeControlId) ??
    DEFAULT_TIME_CONTROL
  );
}

export function getTimeControlGroup(timeControl: TimeControl) {
  return (
    TIME_CONTROL_GROUPS.find((group) => group.id === timeControl.category) ??
    TIME_CONTROL_GROUPS[0]
  );
}

type TimeControlPickerProps = {
  selectedId: string;
  onChange: (timeControl: TimeControl) => void;
};

export function TimeControlPicker({ selectedId, onChange }: TimeControlPickerProps) {
  return (
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
                  onClick={() => onChange(timeControl)}
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
  );
}
