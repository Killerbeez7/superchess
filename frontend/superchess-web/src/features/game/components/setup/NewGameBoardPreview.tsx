import { ChessBoard } from "@/features/game/components/board/ChessBoard";
import { GamePlayerBar } from "@/features/game/components/GamePlayerBar";
import { GameTable } from "@/features/game/components/room/GameTable";
import type { TimeControl } from "@/features/game/components/setup/TimeControlPicker";
import { createStartPosition } from "@/utils/board/position";

type NewGameBoardPreviewProps = {
  playerName?: string;
  timeControl: TimeControl;
};

function formatInitialClock(timeControl: TimeControl) {
  return `${timeControl.minutes}:00`;
}

export function NewGameBoardPreview({
  playerName,
  timeControl,
}: NewGameBoardPreviewProps) {
  const timer = formatInitialClock(timeControl);

  return (
    <GameTable
      topPlayer={
        <GamePlayerBar
          name="Waiting for player 2"
          color="black"
          timer={timer}
          isActive={false}
        />
      }
      board={
        <ChessBoard variant="app" position={createStartPosition()} interactive={false} />
      }
      bottomPlayer={
        <GamePlayerBar
          name={playerName?.trim() || "Player 1"}
          color="white"
          timer={timer}
          isActive={false}
        />
      }
    />
  );
}
