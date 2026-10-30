/**
 * PlayScreen — the full-screen play experience at /play/[level] (port of the web components/PlayScreen.tsx).
 *
 *   slim top bar (72px + safe area): Back to map · level chip · stars · screen time · mute
 *   play canvas (the mat card) filling every remaining pixel: the grade module for puzzle levels
 *   (keyed, with the level's puzzle params) or PhysicalQuestOverlay for quest levels.
 *
 * Per level: stealth PAL starts OFF and engages on the module's onStruggle() (sfx.palShimmer() on the
 * false → true flip). Solving / confirming records the level exactly once (actions.completeLevel) and
 * opens the celebration; Claim → the map.
 *
 * Screen time ticks once a second only while a puzzle is on screen, the app is in the foreground and no
 * sheet or modal is open (Physical Quests pause it). At 0 a warm "That's today's screen time!" sheet ends
 * the session — never a countdown in the child's face.
 *
 * Navigation: the native stack keeps /home mounted underneath, so "back to the map" pops back to it
 * (router.back()) when it is the previous screen; home then regains focus and plays the unlock
 * animation from the store's `justUnlocked` (set by actions.completeLevel). Otherwise → replace(/home).
 */

import { useEffect } from "react";
import { router } from "expo-router";

import PlaySession from "@/features/play/components/PlaySession";
import SplashBackdrop from "@/components/backdrops/SplashBackdrop";
import { getLevel, isPlayable } from "@/data/levels";
import { ROUTES } from "@/constants/routes";
import { actions, useActiveProfile } from "@/state/store";
import { useGuard } from "@/hooks/useGuard";

export interface PlayScreenProps {
  /** 1-based level number on the active profile's grade map. */
  levelNumber: number;
}

/* ------------------------------------------------------------------------------------------------
 * Route-level component: guard + playable check, then one PlaySession per (child, grade, level)
 * ---------------------------------------------------------------------------------------------- */

export default function PlayScreen({ levelNumber }: Readonly<PlayScreenProps>) {
  const ready = useGuard("profile");
  const profile = useActiveProfile();

  const grade = profile?.grade ?? null;
  const level = grade ? getLevel(grade, levelNumber) : null;
  const playable = profile !== null && level !== null && isPlayable(profile.grade, levelNumber, profile.progress[profile.grade] ?? 0);
  const bounce = ready && profile !== null && !playable;

  useEffect(() => {
    actions.ensureToday();
  }, []);

  useEffect(() => {
    if (bounce) router.replace(ROUTES.home);
  }, [bounce]);

  if (!ready || !profile || !level || !playable) return <SplashBackdrop />;

  // Keyed so a grade switch (or another child) starts a fresh session: PAL off, nothing completed, no celebration.
  return <PlaySession key={`${profile.id}:${profile.grade}:${levelNumber}`} profile={profile} level={level} />;
}
