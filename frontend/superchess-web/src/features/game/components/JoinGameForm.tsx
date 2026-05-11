"use client";

type Props = {
  isJoining: boolean;
  playerName: string;
  onSubmit: () => Promise<void>;
};

export function JoinGameForm({ isJoining, playerName, onSubmit }: Props) {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit();
      }}
      className="space-y-4"
    >
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Joining as
        </p>
        <p className="mt-1 text-sm font-semibold text-white">{playerName}</p>
      </div>
      <button
        type="submit"
        disabled={isJoining}
        className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isJoining ? "Joining..." : "Join as black"}
      </button>
    </form>
  );
}
