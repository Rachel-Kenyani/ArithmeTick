/**
 * React hooks for reading the store (re-rendering via useSyncExternalStore).
 */

import { useSyncExternalStore } from "react";

import type { ChildProfile, AppState } from "@/types/models";
import { SESSION_CAP_SECONDS } from "@/types/domain";

import { getSnapshot, isHydrated, subscribe } from "./core";

/** The whole persisted state (DEFAULT_STATE until hydrated). */
export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

/** false until the saved state has been read from the device — gate redirects on this. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, isHydrated);
}

export function useActiveProfile(): ChildProfile | null {
  const s = useAppState();
  return s.profiles.find((p) => p.id === s.activeProfileId) ?? null;
}

/** Seconds of today's 15-minute allowance left (call actions.ensureToday() on mount to roll the day over). */
export function useScreenTimeRemaining(): number {
  const s = useAppState();
  return Math.max(0, SESSION_CAP_SECONDS - s.screenTime.usedSeconds);
}
