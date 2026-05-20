"use client";

import { useGameStats } from "@/features/game/hooks/useGameStats";

type StatItem = {
  label: string;
  value: number | string;
};

export function StatsPanel() {
  const { stats, isLoading, error } = useGameStats();
  const items: StatItem[] = [
    { label: "Games", value: stats?.games ?? "-" },
    { label: "Wins", value: stats?.wins ?? "-" },
    { label: "Draws", value: stats?.draws ?? "-" },
    { label: "Losses", value: stats?.losses ?? "-" },
  ].map((item) => ({
    ...item,
    value: isLoading ? "..." : item.value,
  }));

  return (
    <section className="rounded-2xl border border-border-light bg-card p-5 shadow-sm">
      <h2 className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
        Stats
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {items.map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-card-muted p-3">
            <p className="text-xs font-semibold text-text-muted">{label}</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
          </div>
        ))}
      </div>

      {error ? (
        <p className="mt-3 px-1 text-xs font-medium text-[#fa412d]">{error}</p>
      ) : null}
    </section>
  );
}
