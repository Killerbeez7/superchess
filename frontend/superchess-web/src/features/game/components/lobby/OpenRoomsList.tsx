import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import type { GameResponse } from "@/types/game";

import { OpenRoomRow } from "./OpenRoomRow";

type OpenRoomsListProps = {
  games: GameResponse[];
  isLoading: boolean;
  isJoining: boolean;
  onRefresh: () => void | Promise<void>;
  onJoin: (gameId: string) => void;
  onOpen: (gameId: string) => void;
};

export function OpenRoomsList({
  games,
  isLoading,
  isJoining,
  onRefresh,
  onJoin,
  onOpen,
}: OpenRoomsListProps) {
  return (
    <section className="rounded-xl border border-white/8 bg-[#1f1e1b]">
      <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">Open games</p>
          <p className="text-xs text-[#b8b8b8]">{games.length} waiting</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void onRefresh()}
            className="rounded-lg border border-white/8 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/6"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="superchess-scrollbar max-h-80 space-y-2 overflow-y-auto p-3">
        {isLoading ? (
          <div className="rounded-xl border border-dashed border-white/8 p-5">
            <LoadingSpinner />
          </div>
        ) : games.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/8 p-5 text-sm text-[#b8b8b8]">
            No waiting games yet.
          </div>
        ) : (
          games.map((game) => (
            <OpenRoomRow
              key={game.id}
              game={game}
              isJoining={isJoining}
              onJoin={onJoin}
              onOpen={onOpen}
            />
          ))
        )}
      </div>
    </section>
  );
}
