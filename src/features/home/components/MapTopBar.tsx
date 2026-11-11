import { useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";

import AppTopBar from "@/components/top-bar/AppTopBar";
import { ROUTES } from "@/constants/routes";
import { navigateToTab } from "@/features/home/components/BottomNav";
import { useActiveProfile, useScreenTimeRemaining } from "@/state/store";

/**
 * The map's top bar for the other tabs (badges, leaderboard, settings): back to the map, sound, stars and time left,
 * so every tab has the same controls in the same place.
 */
export default function MapTopBar({ onBadges = false }: Readonly<{ onBadges?: boolean }>) {
  const profile = useActiveProfile();
  const secondsLeft = useScreenTimeRemaining();
  const focused = useIsFocused();
  if (!profile) return null;
  return (
    <>
      {focused ? <StatusBar style="light" /> : null}
      <AppTopBar
        backLabel="Back to map"
        onBack={() => navigateToTab(ROUTES.home)}
        stars={profile.stars}
        secondsLeft={secondsLeft}
        onStarsPress={onBadges ? undefined : () => navigateToTab(ROUTES.badges)}
      />
    </>
  );
}
