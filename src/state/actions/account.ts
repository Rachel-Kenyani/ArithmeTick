/**
 * Account actions — splash flag, mock signup / login / password reset, Google mock, logout.
 * Passwords are never accepted or stored.
 */

import { getSnapshot, setState } from "../core";
import { demoProfiles } from "../seed";

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
   * Record a checked one-time code for the pending flow (services/auth checks the code itself).
   * Signup → the account is created and signed in. Reset → the pending flow stays until resetPassword().
   */
  verifyCode(code: string): boolean {
    if (!/^\d+$/.test(code)) return false;
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
   * "Continue with Google" succeeded (services/googleAuth). Only the offline sample identity on Log In seeds
   * the demo children; real accounts keep the explorers already on this phone.
   */
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
