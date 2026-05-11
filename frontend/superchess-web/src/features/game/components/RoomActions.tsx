import Link from "next/link";

type RoomActionsProps = {
  onRefresh: () => void;
};

export function RoomActions({ onRefresh }: RoomActionsProps) {
  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={onRefresh}
        className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
      >
        Refresh room
      </button>

      <Link
        href="/play"
        className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/5"
      >
        Browse rooms
      </Link>
    </div>
  );
}
