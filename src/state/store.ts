/**
 * ArithmeTick app store — a tiny external store persisted to AsyncStorage (loaded once at startup).
 *
 * Read it with the hooks (useAppState / useActiveProfile / useHydrated). Change it ONLY through
 * `actions` (from event handlers or effects — never during render).
 *
 * Auth is a local mock for the prototype: nothing leaves the device, no network calls, and
 * passwords are never stored anywhere (actions don't even accept them).
 */

import type { AppState } from "@/types/models";

import { getSnapshot } from "./core";

export { DEFAULT_STATE, whenHydrated } from "./core";
export { useActiveProfile, useAppState, useHydrated, useScreenTimeRemaining } from "./hooks";
export { actions, draftKey, type LevelCompletion } from "./actions";

/** Test/reviewer helper: the raw snapshot outside React. */
export function getAppState(): AppState {
  return getSnapshot();
}
