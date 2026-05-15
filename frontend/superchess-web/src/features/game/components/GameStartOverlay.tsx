type GameStartOverlayProps = {
  whitePlayerName: string;
  blackPlayerName: string;
};

export function GameStartOverlay({
  whitePlayerName,
  blackPlayerName,
}: GameStartOverlayProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-sm"
      aria-hidden="true"
    >
      <div className="game-start-overlay-top absolute inset-x-0 top-0 h-1/2 border-b border-white/10 bg-panel/95" />
      <div className="game-start-overlay-bottom absolute inset-x-0 bottom-0 h-1/2 border-t border-white/10 bg-panel/95" />

      <div className="game-start-overlay-content absolute inset-0 grid place-items-center px-4">
        <div className="w-full max-w-xs rounded-2xl border border-app-border bg-sidebar/95 px-5 py-4 text-center shadow-2xl">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm font-semibold text-text-primary">
            <span className="truncate text-right">{whitePlayerName}</span>
            <span className="rounded-full bg-primary-green px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-panel">
              vs
            </span>
            <span className="truncate text-left">{blackPlayerName}</span>
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary-green">
            Lets begin
          </p>
        </div>
      </div>
    </div>
  );
}
