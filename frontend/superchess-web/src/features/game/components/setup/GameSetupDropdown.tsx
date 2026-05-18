"use client";

import { useState } from "react";
import clsx from "clsx";
import { FaChevronDown } from "react-icons/fa6";
import {
  DEFAULT_GAME_MODE,
  GAME_MODE_OPTIONS,
  GameModePicker,
  type GameMode,
  type GameModeId,
} from "@/features/game/components/setup/GameModePicker";
import {
  getTimeControlGroup,
  TimeControlPicker,
  type TimeControl,
} from "@/features/game/components/setup/TimeControlPicker";

type GameSetupDropdownProps = {
  selectedTimeControl: TimeControl;
  onTimeControlChange: (timeControl: TimeControl) => void;
};

export function GameSetupDropdown({
  selectedTimeControl,
  onTimeControlChange,
}: GameSetupDropdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedModeId, setSelectedModeId] = useState<GameModeId>(DEFAULT_GAME_MODE.id);

  const selectedGroup = getTimeControlGroup(selectedTimeControl);
  const selectedMode =
    GAME_MODE_OPTIONS.find((mode) => mode.id === selectedModeId) ?? DEFAULT_GAME_MODE;

  function handleModeChange(mode: GameMode) {
    if (!mode.isAvailable) return;
    setSelectedModeId(mode.id);
  }

  function handleTimeControlChange(timeControl: TimeControl) {
    onTimeControlChange(timeControl);
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
          <div className="grid gap-4">
            <TimeControlPicker
              selectedId={selectedTimeControl.id}
              onChange={handleTimeControlChange}
            />

            <GameModePicker selectedId={selectedModeId} onChange={handleModeChange} />
          </div>
        </div>
      )}
    </div>
  );
}
