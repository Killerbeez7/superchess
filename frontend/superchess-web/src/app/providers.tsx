"use client";

import type { ReactNode } from "react";

import { GameSoundProvider } from "@/features/game/sounds/GameSoundProvider";
import { AuthProvider } from "@/features/auth/hooks/useAuth";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <GameSoundProvider>{children}</GameSoundProvider>
    </AuthProvider>
  );
}
