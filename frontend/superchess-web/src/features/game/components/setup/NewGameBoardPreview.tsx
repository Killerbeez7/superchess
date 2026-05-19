import { ChessBoard } from "@/features/game/components/board/ChessBoard";
import { GamePlayerBar } from "@/features/game/components/GamePlayerBar";
import { GameTable } from "@/features/game/components/room/GameTable";
import type { TimeControl } from "@/features/game/components/setup/TimeControlPicker";
import type { PieceColor } from "@/types/game";
import { createStartPosition } from "@/utils/board/position";

type NewGameBoardPreviewProps = {
  playerName?: string;
  timeControl: TimeControl;
  playerColor?: PieceColor;
  opponentName?: string;
};

function formatInitialClock(timeControl: TimeControl) {
  return `${timeControl.minutes}:00`;
}

export function NewGameBoardPreview({
  playerName,
  timeControl,
  playerColor = "white",
  opponentName = "Waiting for player 2",
}: NewGameBoardPreviewProps) {
  const timer = formatInitialClock(timeControl);
  const opponentColor = playerColor === "white" ? "black" : "white";

  return (
    <GameTable
      topPlayer={
        <GamePlayerBar
          name={opponentName}
          color={opponentColor}
          timer={timer}
          isActive={false}
        />
      }
      board={
        <ChessBoard
          variant="app"
          position={createStartPosition()}
          perspective={playerColor}
          interactive={false}
        />
      }
      bottomPlayer={
        <GamePlayerBar
          name={playerName?.trim() || "Player 1"}
          color={playerColor}
          timer={timer}
          isActive={false}
        />
      }
    />
  );
}
