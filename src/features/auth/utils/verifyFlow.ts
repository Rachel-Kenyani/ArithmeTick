/**
 * Verify screen constants and per-purpose copy (signup → "Almost Done!", reset → Reset Password).
 */

import { ROUTES } from "@/constants/routes";

/** The Supabase project sends 8-digit codes (email and SMS); keep in step with supabase/config.toml otp_length. */
export const CODE_LENGTH = 8;
/** One code per number/email per 60s (Supabase's limit), so Resend Code unlocks when this clock ends. */
export const CODE_LIFETIME_SECONDS = 60;
/** A beat to see the last digit land / "Verified" before the next screen. */
export const SUCCESS_PAUSE_MS = 450;
export const TOAST_MS = 2400;

export const FLOW = {
  signup: {
    title: "Verify Account",
    cta: "Verify My Account",
    back: ROUTES.signup,
    next: ROUTES.addExplorer,
  },
  reset: {
    title: "Verify Identity",
    cta: "Verify & Continue",
    back: ROUTES.forgotPassword,
    next: ROUTES.resetPassword,
  },
} as const;

export function clock(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
