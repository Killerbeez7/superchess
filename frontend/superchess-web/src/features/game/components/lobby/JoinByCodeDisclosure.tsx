import type { SubmitEvent } from "react";

type JoinByCodeDisclosureProps = {
  value: string;
  isJoining: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
};

export function JoinByCodeDisclosure({
  value,
  isJoining,
  onChange,
  onSubmit,
}: JoinByCodeDisclosureProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-white/8 bg-[#1f1e1b] p-3"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">Join by code</p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b8b8b8]">
          Room ID
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_78px] gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste code"
          className="h-9 min-w-0 rounded-md border border-white/8 bg-[#262421] px-3 text-sm text-white outline-none transition placeholder:text-[#777] focus:border-[#81b64c]"
        />

        <button
          type="submit"
          disabled={isJoining}
          className="h-9 rounded-md bg-[#81b64c] px-3 text-xs font-bold text-[#1f1e1b] shadow-sm transition hover:bg-[#95c85a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isJoining ? "..." : "Join"}
        </button>
      </div>
    </form>
  );
}
