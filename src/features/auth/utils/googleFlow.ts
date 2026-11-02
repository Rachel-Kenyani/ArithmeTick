import { router } from "expo-router";

import { ROUTES } from "@/constants/routes";
import { continueWithGoogle } from "@/services/googleAuth";
import { actions, getAppState } from "@/state/store";

export async function googleContinue(intent: "login" | "signup"): Promise<string | null> {
  const result = await continueWithGoogle();
  if (!result.ok) return result.cancelled ? null : result.message;
  actions.continueWithGoogle(result, intent);
  const hasExplorers = getAppState().profiles.length > 0;
  router.push(result.isNew || !hasExplorers ? ROUTES.addExplorer : ROUTES.profiles);
  return null;
}
