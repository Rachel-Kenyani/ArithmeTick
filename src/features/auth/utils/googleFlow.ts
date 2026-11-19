import { router } from "expo-router";

import { ROUTES } from "@/constants/routes";
import { restoreFamily } from "@/services/familySync";
import { continueWithGoogle } from "@/services/googleAuth";
import { actions, getAppState } from "@/state/store";

export async function googleContinue(): Promise<string | null> {
  const result = await continueWithGoogle();
  if (!result.ok) return result.cancelled ? null : result.message;
  actions.continueWithGoogle(result);
  await restoreFamily();
  const hasExplorers = getAppState().profiles.length > 0;
  router.push(hasExplorers ? ROUTES.profiles : ROUTES.addExplorer);
  return null;
}
