import Link from "next/link";

export function RecentGamesPanel() {
  return (
    <section className="rounded-2xl border border-border-light bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          Recent games
        </h2>

        <Link
          href="/games"
          className="rounded-md border border-border-light px-2.5 py-1.5 text-xs font-semibold text-text-muted transition hover:bg-bg-light hover:text-text-primary"
        >
          History
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border-light bg-card-muted">
        <div className="grid grid-cols-[44px_1.5fr_0.7fr_0.7fr_0.9fr] border-b border-border-light bg-card-header px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
          <span />
          <span>Players</span>
          <span>Result</span>
          <span>Moves</span>
          <span>Date</span>
        </div>

        <div className="grid grid-cols-[44px_1.5fr_0.7fr_0.7fr_0.9fr] items-center px-4 py-4 text-sm">
          <span className="text-xl text-accent">♟</span>

          <div>
            <p className="font-semibold text-text-primary">No games yet</p>
            <p className="mt-0.5 text-xs text-text-muted">
              Your match history will appear here.
            </p>
          </div>

          <span className="text-text-subtle">—</span>
          <span className="text-text-subtle">—</span>
          <span className="text-text-subtle">—</span>
        </div>
      </div>
    </section>
  );
}
