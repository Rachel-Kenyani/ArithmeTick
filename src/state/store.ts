import type { AppState } from "@/types/models";

import { getSnapshot } from "./core";

export { DEFAULT_STATE, whenHydrated } from "./core";
export { useActiveProfile, useAppState, useHydrated, useScreenTimeRemaining } from "./hooks";
export { actions, draftKey, type LevelCompletion } from "./actions";

export function getAppState(): AppState {
  return getSnapshot();
}
