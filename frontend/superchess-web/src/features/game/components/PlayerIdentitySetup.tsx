"use client";

import { useState } from "react";
import type { SubmitEvent } from "react";

type PlayerIdentitySetupProps = {
  onSave: (displayName: string) => void;
  isSaving?: boolean;
};

export function PlayerIdentitySetup({
  onSave,
  isSaving = false,
}: PlayerIdentitySetupProps) {
  const [displayName, setDisplayName] = useState("");

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = displayName.trim();
    if (!trimmed) return;

    onSave(trimmed);
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 p-4">
      <section className="w-full max-w-md rounded-3xl border border-app-border bg-panel p-5 shadow-2xl sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          Player
        </p>

        <h2 className="mt-1 text-lg font-semibold text-text-primary">Choose your name</h2>

        <p className="mt-2 text-sm leading-6 text-text-muted">
          Set your player name once. You can change it later.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your player name"
            autoFocus
            className="w-full rounded-2xl border border-app-border bg-sidebar px-4 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary-green"
          />

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-full bg-primary-green px-5 py-3 text-sm font-semibold text-panel transition hover:bg-primary-green-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save name"}
          </button>
        </form>
      </section>
    </div>
  );
}
