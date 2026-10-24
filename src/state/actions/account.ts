/**
 * Account actions — splash flag, mock signup / login / password reset, Google mock, logout.
 * Passwords are never accepted or stored.
 */

import { getSnapshot, setState } from "../core";
import { demoProfiles } from "../seed";

/** Placeholder identity until native Google Sign-In is wired in. */
export const MOCK_GOOGLE_IDENTITY = { email: "parent@gmail.com", name: null } as const;

export const accountActions = {
  markSplashSeen() {
    setState((s) => (s.seenSplash ? s : { ...s, seenSplash: true }));
  },

  /** Create Account → we "send" a code to `identifier`; Verify Account comes next. */
  beginSignup(identifier: string) {
    setState((s) => ({ ...s, pending: { identifier: identifier.trim(), purpose: "signup" } }));
  },

  /** Forgot Password → we "send" a code; Verify Identity then Reset Password come next. */
  beginReset(identifier: string) {
    setState((s) => ({ ...s, pending: { identifier: identifier.trim(), purpose: "reset" } }));
  },

  /**
   * Check a one-time code for the pending flow. Prototype rule: any 5 digits pass.
   * Signup → the account is created and signed in. Reset → the pending flow stays until resetPassword().
   */
  verifyCode(code: string): boolean {
    if (!/^\d{5}$/.test(code)) return false;
    const pending = getSnapshot().pending;
    if (!pending) return false;
    if (pending.purpose === "signup") {
      setState((s) => ({ ...s, account: { identifier: pending.identifier, method: "password" }, pending: null }));
    }
    return true;
  },

  /** Reset Password saved (the new password itself is never stored in the prototype). */
  completeReset() {
    setState((s) => ({ ...s, pending: null }));
  },

  /** Log In with email/phone + password. Seeds the demo children on a fresh device. */
  login(identifier: string) {
    setState((s) => ({
      ...s,
      account: { identifier: identifier.trim(), method: "password" },
      pending: null,
      profiles: s.profiles.length ? s.profiles : demoProfiles(),
    }));
  },

  /**
   * "Continue with Google". Still mocked on mobile (native Google Sign-In comes later) — callers pass
   * MOCK_GOOGLE_IDENTITY. Login seeds demo children on a fresh device; signup starts empty.
   */
  continueWithGoogle(intent: "login" | "signup", identity: { email: string; name: string | null }) {
    setState((s) => ({
      ...s,
      account: { identifier: identity.email, method: "google", name: identity.name },
      pending: null,
      profiles: s.profiles.length || intent === "signup" ? s.profiles : demoProfiles(),
    }));
  },

  logout() {
    setState((s) => ({ ...s, account: null, activeProfileId: null, pending: null }));
  },
};
