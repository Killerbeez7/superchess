import type { GameResponse } from "@/types/game";

type OpenRoomRowProps = {
  game: GameResponse;
  isJoining: boolean;
  onJoin: (gameId: string) => void;
  onOpen: (gameId: string) => void;
};

function shortId(id: string) {
  return id.slice(0, 8);
}

export function OpenRoomRow({ game, isJoining, onJoin, onOpen }: OpenRoomRowProps) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#1f1e1b] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {game.whitePlayer.displayName}
          </p>
          <p className="mt-0.5 font-mono text-xs text-[#b8b8b8]">{shortId(game.id)}</p>
        </div>

        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-300">
          Waiting
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onJoin(game.id)}
          disabled={isJoining}
          className="rounded-md bg-[#81b64c] px-3 py-1.5 text-xs font-bold text-[#1f1e1b] shadow-sm transition hover:bg-[#95c85a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isJoining ? "Joining..." : "Join"}
        </button>
        <button
          type="button"
          onClick={() => onOpen(game.id)}
          className="rounded-md border border-white/8 px-3 py-1.5 text-xs font-semibold text-[#e7e5e4] transition hover:bg-white/6 hover:text-white"
        >
          Open
        </button>
      </div>
    </div>
  );
}
