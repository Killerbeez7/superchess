import type { GameResponse, PieceColor } from "@/types/game";

type GameEndBannerProps = {
  game: GameResponse;
  timedOutColor?: PieceColor | null;
  onDismiss: () => void;
};

function getPlayerName(game: GameResponse, color: PieceColor | null) {
  if (color === "white") return game.whitePlayer.displayName;
  if (color === "black") return game.blackPlayer?.displayName ?? "Black";
  return null;
}

function oppositeColor(color: PieceColor): PieceColor {
  return color === "white" ? "black" : "white";
}

export function GameEndBanner({
  game,
  timedOutColor = null,
  onDismiss,
}: GameEndBannerProps) {
  const reason = game.status === "completed" ? game.endReason : "timeout";
  const winnerColor =
    game.status === "completed" ? game.winnerColor : timedOutColor
      ? oppositeColor(timedOutColor)
      : null;
  const winnerName = getPlayerName(game, winnerColor);

  const title =
    reason === "checkmate"
      ? "Checkmate"
      : reason === "stalemate"
        ? "Stalemate"
        : reason === "timeout"
          ? "Time expired"
          : "Game over";

  const description =
    reason === "stalemate"
      ? "The game is a draw."
      : winnerName
        ? `${winnerName} wins${reason === "timeout" ? " on time" : ""}.`
        : "The game has ended.";

  return (
    <div
      className="pointer-events-none absolute inset-0 z-40 grid place-items-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-end-title"
    >
      <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950/95 p-5 text-center shadow-2xl">
        <p
          id="game-end-title"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/80"
        >
          {title}
        </p>
        <p className="mt-2 text-lg font-bold text-white">{description}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-5 w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white"
        >
          Review board
        </button>
      </div>
    </div>
  );
}
