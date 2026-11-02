import { useSyncExternalStore } from "react";

import type { ChildProfile, AppState } from "@/types/models";
import { SCREEN_TIME_ENABLED, SESSION_CAP_SECONDS } from "@/types/domain";

import { getSnapshot, isHydrated, subscribe } from "./core";

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, isHydrated);
}

export function useActiveProfile(): ChildProfile | null {
  const s = useAppState();
  return s.profiles.find((p) => p.id === s.activeProfileId) ?? null;
}

export function useScreenTimeRemaining(): number {
  const s = useAppState();
  if (!SCREEN_TIME_ENABLED) return SESSION_CAP_SECONDS;
  return Math.max(0, SESSION_CAP_SECONDS - s.screenTime.usedSeconds);
}
