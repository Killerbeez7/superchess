"use client";

import type { ReactNode } from "react";

import { GameSoundProvider } from "@/features/game/sounds/GameSoundProvider";

export function Providers({ children }: { children: ReactNode }) {
  return <GameSoundProvider>{children}</GameSoundProvider>;
}
