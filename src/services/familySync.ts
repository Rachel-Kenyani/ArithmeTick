import { progressSync } from "@/services/progressSync";
import { accountKey } from "@/state/actions/account";
import { getSnapshot, subscribe } from "@/state/core";
import { actions } from "@/state/store";
import type { ChildProfile } from "@/types/models";

/** Wait this long after a change before saving, so a burst of changes (a finished level) is one save. */
export const SAVE_DELAY_MS = 2000;
/** After a failed restore (offline), try again no sooner than this. */
export const RETRY_MS = 30_000;

let restoredFor: string | null = null;
let restoring: Promise<void> | null = null;
let lastTry = 0;
let lastSaved: readonly ChildProfile[] | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;

/**
 * Brings back the family saved with the signed-in account and merges it with this phone's, then saves the result.
 * Saving waits until this has worked once for the account, so an old copy on this phone never overwrites newer
 * progress saved from another phone.
 */
export function restoreFamily(): Promise<void> {
  const account = getSnapshot().account;
  if (!account) return Promise.resolve();
  const key = accountKey(account.identifier);
  if (restoring) return restoring;
  lastTry = Date.now();
  restoring = (async () => {
    const saved = await progressSync.load();
    if (saved === null) return;
    actions.mergeSavedFamily(account.identifier, saved);
    const current = getSnapshot();
    if (!current.account || accountKey(current.account.identifier) !== key) return;
    restoredFor = key;
    lastSaved = current.profiles;
    await progressSync.save(current.profiles);
  })().finally(() => {
    restoring = null;
  });
  return restoring;
}

function onChange() {
  const { account, profiles } = getSnapshot();
  if (!account) {
    restoredFor = null;
    clearTimeout(timer);
    return;
  }
  if (restoredFor !== accountKey(account.identifier)) {
    if (!restoring && Date.now() - lastTry >= RETRY_MS) void restoreFamily();
    return;
  }
  if (profiles === lastSaved) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    const now = getSnapshot();
    if (!now.account || restoredFor !== accountKey(now.account.identifier)) return;
    lastSaved = now.profiles;
    void progressSync.save(now.profiles);
  }, SAVE_DELAY_MS);
}

/** Keeps the family saved with the account while the app runs. Returns a function that stops it. */
export function startFamilySync(): () => void {
  lastTry = 0;
  onChange();
  const stop = subscribe(onChange);
  return () => {
    stop();
    clearTimeout(timer);
  };
}

/** For tests: forget what has been restored and saved. */
export function resetFamilySync() {
  restoredFor = null;
  restoring = null;
  lastTry = 0;
  lastSaved = null;
  clearTimeout(timer);
}
