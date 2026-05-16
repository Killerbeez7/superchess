const stats = [
  ["Games", "-"],
  ["Wins", "-"],
  ["Draws", "-"],
  ["Losses", "-"],
] as const;

export function StatsPanel() {
  return (
    <section className="rounded-2xl border border-border-light bg-card p-5 shadow-sm">
      <h2 className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
        Stats
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-card-muted p-3">
            <p className="text-xs font-semibold text-text-muted">{label}</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
