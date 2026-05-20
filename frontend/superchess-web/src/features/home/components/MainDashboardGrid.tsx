import { Children, type ReactNode } from "react";

type MainDashboardGridProps = {
  children: ReactNode;
};

export function MainDashboardGrid({ children }: MainDashboardGridProps) {
  const panels = Children.toArray(children);
  const actionPanel = panels[0];
  const historyPanel = panels[1];
  const statsPanel = panels[2];
  const watchPanel = panels[3];

  return (
    <div className="grid gap-5 min-[1400px]:grid-cols-[minmax(0,1fr)_360px]">
      <div className="contents min-[1400px]:grid min-[1400px]:gap-5">
        <div className="order-1 min-[1400px]:order-none">{actionPanel}</div>
        <div className="order-2 min-[1400px]:order-none">{historyPanel}</div>
      </div>

      <aside className="contents min-[1400px]:grid min-[1400px]:gap-5 min-[1400px]:self-start">
        <div className="order-3 min-[1400px]:order-none">{statsPanel}</div>
        <div className="order-4 min-[1400px]:order-none">{watchPanel}</div>
      </aside>
    </div>
  );
}
