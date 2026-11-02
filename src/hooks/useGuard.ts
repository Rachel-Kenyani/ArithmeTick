import { router } from "expo-router";
import { useEffect } from "react";

import { ROUTES } from "@/constants/routes";
import { useAppState } from "@/state/store";

export function useGuard(need: "account" | "profile"): boolean {
  const s = useAppState();

  let redirect: string | null = null;
  if (!s.account) redirect = ROUTES.welcome;
  else if (need === "profile" && !s.profiles.some((p) => p.id === s.activeProfileId)) redirect = ROUTES.profiles;

  useEffect(() => {
    if (redirect) router.replace(redirect as never);
  }, [redirect]);

  return redirect === null;
}
