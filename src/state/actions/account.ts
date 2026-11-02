import { getSnapshot, setState } from "../core";
import { demoProfiles } from "../seed";

export const accountActions = {
  markSplashSeen() {
    setState((s) => (s.seenSplash ? s : { ...s, seenSplash: true }));
  },

  beginSignup(identifier: string) {
    setState((s) => ({ ...s, pending: { identifier: identifier.trim(), purpose: "signup" } }));
  },

  beginReset(identifier: string) {
    setState((s) => ({ ...s, pending: { identifier: identifier.trim(), purpose: "reset" } }));
  },

  verifyCode(code: string): boolean {
    if (!/^\d+$/.test(code)) return false;
    const pending = getSnapshot().pending;
    if (!pending) return false;
    if (pending.purpose === "signup") {
      setState((s) => ({ ...s, account: { identifier: pending.identifier, method: "password" }, pending: null }));
    }
    return true;
  },

  completeReset() {
    setState((s) => ({ ...s, pending: null }));
  },

  login(identifier: string) {
    setState((s) => ({
      ...s,
      account: { identifier: identifier.trim(), method: "password" },
      pending: null,
      profiles: s.profiles.length ? s.profiles : demoProfiles(),
    }));
  },

  continueWithGoogle(identity: { email: string; name: string | null; sample: boolean }, intent: "login" | "signup") {
    setState((s) => ({
      ...s,
      account: { identifier: identity.email, method: "google", name: identity.name },
      pending: null,
      profiles: s.profiles.length || !identity.sample || intent === "signup" ? s.profiles : demoProfiles(),
    }));
  },

  logout() {
    setState((s) => ({ ...s, account: null, activeProfileId: null, pending: null }));
  },
};
