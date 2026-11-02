import { useCallback } from "react";
import { router, useNavigation } from "expo-router";

import { ROUTES } from "@/constants/routes";

export default function useGoToMap() {
  const navigation = useNavigation();
  return useCallback(() => {
    const state = navigation.getState();
    const prev = state && state.index > 0 ? state.routes[state.index - 1] : undefined;
    if (prev?.name === "home" && router.canGoBack()) router.back();
    else router.replace(ROUTES.home);
  }, [navigation]);
}
