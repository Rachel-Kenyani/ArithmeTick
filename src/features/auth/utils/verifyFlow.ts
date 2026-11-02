import { ROUTES } from "@/constants/routes";

export const CODE_LENGTH = 8;
export const CODE_LIFETIME_SECONDS = 60;
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
