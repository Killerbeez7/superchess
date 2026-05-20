"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { HomeDashboard } from "@/features/home/components/HomeDashboard";
import { HomeLoadingState } from "@/features/home/components/HomeLoadingState";
import { LoggedOutLanding } from "@/features/home/components/LoggedOutLanding";

export function HomeClient() {
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return <HomeLoadingState />;
  }

  return isAuthenticated ? <HomeDashboard /> : <LoggedOutLanding />;
}
