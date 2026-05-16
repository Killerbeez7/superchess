const badges = ["Realtime rooms", "Timed games", "Move history"] as const;

export function LiveGamesPanel() {
  return (
    <section className="rounded-2xl border border-border-light bg-card p-5 shadow-sm">
      <h2 className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
        Live games
      </h2>

      <p className="mt-4 text-sm leading-6 text-text-muted">
        Spectator mode and top player games are coming later.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span
            key={badge}
            className="rounded-full border border-border-light bg-card-muted px-3 py-1.5 text-xs font-semibold text-text-muted"
          >
            {badge}
          </span>
        ))}
      </div>
    </section>
  );
}
