type GameTableProps = {
  topPlayer: React.ReactNode;
  board: React.ReactNode;
  bottomPlayer: React.ReactNode;
  overlays?: React.ReactNode;
};

export function GameTable({ topPlayer, board, bottomPlayer, overlays }: GameTableProps) {
  return (
    <div className="flex h-full min-h-0 w-full max-w-[min(96vw,calc(100dvh-210px))] flex-col justify-center gap-2 lg:max-w-[min(calc(100dvh-168px),calc(100vw-660px),920px)]">
      {topPlayer}

      <div
        className="relative aspect-square w-full shrink-0 select-none overflow-hidden"
        style={{
          touchAction: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
        }}
      >
        {board}
        {overlays}
      </div>

      {bottomPlayer}
    </div>
  );
}
