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
