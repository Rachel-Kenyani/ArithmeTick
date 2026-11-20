import { useSyncExternalStore } from "react";

import type { ChildProfile, AppState } from "@/types/models";
import { SCREEN_TIME_ENABLED, dailyLimitSeconds } from "@/types/domain";

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

/** Seconds of play left today under the family's daily limit. */
export function secondsLeftToday(s: Pick<AppState, "dailyLimitMinutes" | "screenTime">): number {
  const limit = dailyLimitSeconds(s.dailyLimitMinutes);
  if (!SCREEN_TIME_ENABLED) return limit;
  return Math.max(0, limit - s.screenTime.usedSeconds);
}

export function useScreenTimeRemaining(): number {
  return secondsLeftToday(useAppState());
}
