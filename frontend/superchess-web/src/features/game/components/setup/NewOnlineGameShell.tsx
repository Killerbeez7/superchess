import type { ReactNode } from "react";

import { PageShell } from "@/components/layout/PageShell";

type NewOnlineGameShellProps = {
  board: ReactNode;
  panel: ReactNode;
  overlays?: ReactNode;
};

export function NewOnlineGameShell({ board, panel, overlays }: NewOnlineGameShellProps) {
  return (
    <PageShell className="overflow-auto lg:overflow-hidden">
      <div className="relative grid min-h-[calc(100dvh-57px)] gap-4 p-3 lg:h-dvh lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6 lg:p-4">
        <section className="flex min-h-0 items-center justify-center overflow-hidden lg:h-full">
          {board}
        </section>

        <section className="min-h-0 lg:h-full">{panel}</section>

        {overlays}
      </div>
    </PageShell>
  );
}
