"use client";

import { useState } from "react";

type Props = {
  isJoining: boolean;
  onSubmit: (playerName: string) => Promise<void>;
};

export function JoinGameForm({ isJoining, onSubmit }: Props) {
  const [name, setName] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit(name);
        setName("");
      }}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="joinName"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Player name
        </label>
        <input
          id="joinName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300"
        />
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
