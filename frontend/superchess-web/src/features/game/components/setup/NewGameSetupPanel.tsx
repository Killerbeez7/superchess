import {
  TimeControlPicker,
  type TimeControl,
} from "@/features/game/components/setup/TimeControlPicker";

type NewGameSetupPanelProps = {
  playerName?: string;
  isIdentityReady: boolean;
  selectedTimeControl: TimeControl;
  isCreating: boolean;
  error: string | null;
  onTimeControlChange: (timeControl: TimeControl) => void;
  onStartGame: () => void | Promise<void>;
  onCreateInviteRoom: () => void | Promise<void>;
};

export function NewGameSetupPanel({
  isIdentityReady,
  selectedTimeControl,
  isCreating,
  error,
  onTimeControlChange,
  onStartGame,
  onCreateInviteRoom,
}: NewGameSetupPanelProps) {
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border-light bg-card shadow-2xl lg:h-full">
      <header className="shrink-0 border-b border-border-light p-4">
        <h2 className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          Create game
        </h2>
      </header>

      <div className="superchess-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        <TimeControlPicker
          selectedId={selectedTimeControl.id}
          onChange={onTimeControlChange}
        />

        <div className="mt-auto grid shrink-0 gap-2">
          <button
            type="button"
            onClick={() => void onStartGame()}
            disabled={!isIdentityReady || isCreating}
            className="h-10 rounded-lg bg-accent px-4 text-sm font-bold text-text-inverse shadow-sm transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? "Creating..." : "Start game"}
          </button>

          <button
            type="button"
            onClick={() => void onCreateInviteRoom()}
            disabled={!isIdentityReady || isCreating}
            className="h-10 rounded-lg border border-border-light bg-card-muted px-4 text-sm font-bold text-text-primary transition hover:border-accent-soft hover:bg-card-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            Create invite room
          </button>
        </div>

        {error && (
          <div className="shrink-0 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}
      </div>
    </aside>
  );
}
