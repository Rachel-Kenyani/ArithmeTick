/**
 * Launcher. First launch on a device → fun splash. Otherwise straight to where the family left off:
 * no grown-up signed in → "Get a Grown-up"; no child chosen → "Who is playing today?"; else the map.
 * The root layout only renders once the saved state is loaded, so this decides synchronously.
 */

import { Redirect } from "expo-router";

import { ROUTES } from "@/constants/routes";
import { useAppState } from "@/state/store";

export default function Launcher() {
  const s = useAppState();
  if (!s.seenSplash) return <Redirect href={ROUTES.splash} />;
  if (!s.account) return <Redirect href={ROUTES.welcome} />;
  if (!s.profiles.some((p) => p.id === s.activeProfileId)) return <Redirect href={ROUTES.profiles} />;
  return <Redirect href={ROUTES.home} />;
}
