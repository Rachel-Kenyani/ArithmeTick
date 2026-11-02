import { useCallback } from "react";
import { router } from "expo-router";

import SplashIntro from "@/features/splash/SplashIntro";
import { ROUTES } from "@/constants/routes";
import { actions } from "@/state/store";

export default function SplashScreen() {
  const goToWelcome = useCallback(() => {
    actions.markSplashSeen();
    router.replace(ROUTES.welcome);
  }, []);
  return <SplashIntro onDone={goToWelcome} />;
}
