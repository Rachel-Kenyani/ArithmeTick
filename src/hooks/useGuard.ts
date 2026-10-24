import { router } from "expo-router";
import { useEffect } from "react";

import { ROUTES } from "@/constants/routes";
import { useAppState } from "@/state/store";

/**
 * Screen guard. Returns `true` when the requirement holds; otherwise redirects (replace) and returns
 * `false` — render a calm placeholder (e.g. just the JungleBackdrop) until it is true.
 * (The root layout only mounts screens after the saved state has loaded.)
 *
 *  "account" — a parent is signed in (else → /welcome)
 *  "profile" — signed in AND a child profile is chosen (else → /welcome or /profiles)
 */
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
