import AsyncStorage from "@react-native-async-storage/async-storage";

import { newlyEarned } from "@/data/badges";
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

let state: AppState = DEFAULT_STATE;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/**
 * Badges are checked when a level is finished. A child who has finished everything would never get a badge that
 * was added or made easier later, so saved profiles are checked again when the app opens.
 */
function withDueBadges(profile: ChildProfile): ChildProfile {
  const due = newlyEarned(profile);
  return due.length ? { ...profile, badges: [...profile.badges, ...due] } : profile;
}

function parse(raw: string | null): AppState {
  if (!raw) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed?.v !== 1) return DEFAULT_STATE;
    const loaded = { ...DEFAULT_STATE, ...parsed } as AppState;
    return { ...loaded, profiles: loaded.profiles.map(withDueBadges) };
  } catch {
    return DEFAULT_STATE;
  }
}

const hydration = AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (state === DEFAULT_STATE) state = parse(raw);
  })
  .catch(() => {})
  .finally(() => {
    hydrated = true;
    emit();
  });

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
