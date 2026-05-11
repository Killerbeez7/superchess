"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type PlayerIdentitySetupProps = {
  onSave: (displayName: string) => void;
  isSaving?: boolean;
};

export function PlayerIdentitySetup({
  onSave,
  isSaving = false,
}: PlayerIdentitySetupProps) {
  const [displayName, setDisplayName] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = displayName.trim();
    if (!trimmed) return;

    onSave(trimmed);
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Player
      </p>
      <h2 className="mt-1 text-lg font-semibold text-white">Choose your name</h2>
      <p className="mt-2 text-sm text-slate-400">
        Set your player name once. You can change it later.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your player name"
          className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300"
        />

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save name
        </button>
      </form>
    </section>
  );
}
