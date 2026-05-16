import type { ReactNode } from "react";
import clsx from "clsx";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main className={clsx("min-h-dvh bg-app text-text-primary", className)}>
      {children}
    </main>
  );
}
