/**
 * The shared "Continue with Google" step for Log In and Create Account: sign in, then go where the parent
 * belongs. New accounts (or a phone with no explorers yet) → "Almost Done!"; returning parents → "Who's playing?".
 */

import { router } from "expo-router";

import { ROUTES } from "@/constants/routes";
import { continueWithGoogle } from "@/services/googleAuth";
import { actions, getAppState } from "@/state/store";

/** Resolves with a message to show, or null when signed in (or the parent closed the Google picker). */
export async function googleContinue(intent: "login" | "signup"): Promise<string | null> {
  const result = await continueWithGoogle();
  if (!result.ok) return result.cancelled ? null : result.message;
  actions.continueWithGoogle(result, intent);
  const hasExplorers = getAppState().profiles.length > 0;
  router.push(result.isNew || !hasExplorers ? ROUTES.addExplorer : ROUTES.profiles);
  return null;
}
