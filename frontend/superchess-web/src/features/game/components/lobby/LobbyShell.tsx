import type { ReactNode } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { ChessBoard } from "@/features/game/components/board/ChessBoard";
import { GamePlayerBar } from "@/features/game/components/GamePlayerBar";
import { GameTable } from "@/features/game/components/room/GameTable";
import { createStartPosition } from "@/utils/board/position";

type LobbyShellProps = {
  children: ReactNode;
  playerName?: string;
};

export function LobbyShell({ children, playerName }: LobbyShellProps) {
  const previewPlayerName = playerName?.trim() || "Player 1";

  return (
    <PageShell className="overflow-auto lg:overflow-hidden">
      <div className="grid min-h-[calc(100dvh-57px)] gap-4 p-3 lg:h-dvh lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6 lg:p-4">
        <section className="flex min-h-0 items-center justify-center overflow-hidden lg:h-full">
          <GameTable
            topPlayer={
              <GamePlayerBar
                name="Waiting for player 2"
                color="black"
                timer="10:00"
                isActive={false}
              />
            }
            board={<ChessBoard variant="app" position={createStartPosition()} />}
            bottomPlayer={
              <GamePlayerBar
                name={previewPlayerName}
                color="white"
                timer="10:00"
                isActive={false}
              />
            }
          />
        </section>

        <section className="min-h-0 lg:h-full">{children}</section>
      </div>
    </PageShell>
  );
}
