import type { Account, AppState } from "@/types/models";

import { getSnapshot, setState } from "../core";

/** One key per account, whatever case the email was typed in. */
export const accountKey = (identifier: string) => identifier.trim().toLowerCase();

/**
 * Signs in as `account`. Children belong to the account that added them: the family of whoever was here before is put
 * away, and this account's own family (empty for a new account) is brought back.
 */
function signInAs(s: AppState, account: Account): AppState {
  const next = accountKey(account.identifier);
  const current = s.account ? accountKey(s.account.identifier) : null;
  if (current === next) return { ...s, account, pending: null };
  const families = { ...s.families };
  if (current) families[current] = s.profiles;
  const own = families[next] ?? [];
  delete families[next];
  return {
    ...s,
    account,
    pending: null,
    families,
    activeProfileId: null,
    profiles: own,
  };
}

export const accountActions = {
  markSplashSeen() {
    setState((s) => (s.seenSplash ? s : { ...s, seenSplash: true }));
  },

  beginSignup(identifier: string, existing = false) {
    setState((s) => ({ ...s, pending: { identifier: identifier.trim(), purpose: existing ? "existing" : "signup" } }));
  },

  beginReset(identifier: string) {
    setState((s) => ({ ...s, pending: { identifier: identifier.trim(), purpose: "reset" } }));
  },

  verifyCode(code: string): boolean {
    if (!/^\d+$/.test(code)) return false;
    const pending = getSnapshot().pending;
    if (!pending) return false;
    if (pending.purpose === "signup") {
      setState((s) => signInAs(s, { identifier: pending.identifier, method: "password" }));
    }
    return true;
  },

  completeReset() {
    setState((s) => ({ ...s, pending: null }));
  },

  login(identifier: string) {
    setState((s) => signInAs(s, { identifier: identifier.trim(), method: "password" }));
  },

  continueWithGoogle(identity: { email: string; name: string | null }) {
    setState((s) => signInAs(s, { identifier: identity.email, method: "google", name: identity.name }));
  },

  setReports(on: boolean) {
    setState((s) => (s.account && s.account.reports !== on ? { ...s, account: { ...s.account, reports: on } } : s));
  },

  /** Puts this account's children away with it, so the next person to sign in starts from their own family. */
  logout() {
    setState((s) => {
      if (!s.account) return { ...s, activeProfileId: null, pending: null };
      return {
        ...s,
        account: null,
        activeProfileId: null,
        pending: null,
        profiles: [],
        families: { ...s.families, [accountKey(s.account.identifier)]: s.profiles },
      };
    });
  },

  /** Moves the signed-in account to a new email. The children come along, since they belong to the account, not the address. */
  changeEmail(newEmail: string) {
    setState((s) => {
      if (!s.account) return s;
      const families = { ...s.families };
      delete families[accountKey(newEmail)];
      return { ...s, account: { ...s.account, identifier: newEmail.trim().toLowerCase() }, families };
    });
  },

  /** Forgets this account and every child in it, on this phone. Other accounts' families stay as they are. */
  deleteAccount() {
    setState((s) => {
      if (!s.account) return { ...s, activeProfileId: null, pending: null };
      const families = { ...s.families };
      delete families[accountKey(s.account.identifier)];
      return { ...s, account: null, activeProfileId: null, pending: null, profiles: [], families };
    });
  },
};
