/**
 * useGoToMap — "back to the map" for the play screen (pop to the mounted /home, else replace).
 */

import { useCallback } from "react";
import { router, useNavigation } from "expo-router";

import { ROUTES } from "@/constants/routes";

/** Back to the mounted map when it is right underneath (keeps its state + lets it play the unlock), else replace. */
export default function useGoToMap() {
  const navigation = useNavigation();
  return useCallback(() => {
    const state = navigation.getState();
    const prev = state && state.index > 0 ? state.routes[state.index - 1] : undefined;
    if (prev?.name === "home" && router.canGoBack()) router.back();
    else router.replace(ROUTES.home);
  }, [navigation]);
}
