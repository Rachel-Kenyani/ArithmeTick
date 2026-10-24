/**
 * Verify screen constants and per-purpose copy (signup → "Almost Done!", reset → Reset Password).
 */

import { ROUTES } from "@/constants/routes";

export const CODE_LENGTH = 5;
/** The mockups start the clock at 00:59. */
export const CODE_LIFETIME_SECONDS = 59;
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
