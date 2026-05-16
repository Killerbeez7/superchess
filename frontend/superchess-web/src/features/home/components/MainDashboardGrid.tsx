import { Children, type ReactNode } from "react";

type MainDashboardGridProps = {
  children: ReactNode;
};

export function MainDashboardGrid({ children }: MainDashboardGridProps) {
  const panels = Children.toArray(children);
  const mainPanels = panels.slice(0, 2);
  const sidePanels = panels.slice(2);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-5">{mainPanels}</div>
      <aside className="grid gap-5 lg:self-start">{sidePanels}</aside>
    </div>
  );
}
