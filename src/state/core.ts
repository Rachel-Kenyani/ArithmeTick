/**
 * Store core — the state container, subscribe/setState/getSnapshot, and AsyncStorage persistence +
 * hydration. Only the state/ modules use this directly; everything else goes through "@/state/store".
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AppState, ChildProfile } from "@/types/models";

const STORAGE_KEY = "arithmetick:v1";

export const DEFAULT_STATE: AppState = Object.freeze({
  v: 1,
  seenSplash: false,
  account: null,
  pending: null,
  profiles: [],
  activeProfileId: null,
  screenTime: { day: "", usedSeconds: 0 },
  justUnlocked: null,
}) as AppState;

/* ------------------------------------------------------------------------------------------------
 * Core store
 * ---------------------------------------------------------------------------------------------- */

let state: AppState = DEFAULT_STATE;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function parse(raw: string | null): AppState {
  if (!raw) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed?.v !== 1) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...parsed } as AppState;
  } catch {
    return DEFAULT_STATE;
  }
}

/** Read the saved state once. Changes made before it finishes win over what was on disk. */
const hydration = AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (state === DEFAULT_STATE) state = parse(raw);
  })
  .catch(() => {})
  .finally(() => {
    hydrated = true;
    emit();
  });

/** Resolves once the saved state is loaded (e.g. to hold the native splash screen). */
export function whenHydrated(): Promise<void> {
  return hydration;
}

export function getSnapshot(): AppState {
  return state;
}

export function isHydrated(): boolean {
  return hydrated;
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function setState(update: (prev: AppState) => AppState) {
  const prev = state;
  const next = update(prev);
  if (next === prev) return;
  state = next;
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
    // Storage full / unavailable: the session still works in memory.
  });
  emit();
}

export function updateProfile(id: string, fn: (p: ChildProfile) => ChildProfile) {
  setState((s) => ({ ...s, profiles: s.profiles.map((p) => (p.id === id ? fn(p) : p)) }));
}

export function todayKey(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
