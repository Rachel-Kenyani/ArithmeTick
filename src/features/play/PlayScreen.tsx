import { useEffect } from "react";
import { router } from "expo-router";

import PlaySession from "@/features/play/components/PlaySession";
import SplashBackdrop from "@/components/backdrops/SplashBackdrop";
import { getLevel, isPlayable } from "@/data/levels";
import { ROUTES } from "@/constants/routes";
import { actions, useActiveProfile } from "@/state/store";
import { useGuard } from "@/hooks/useGuard";

export interface PlayScreenProps {
  levelNumber: number;
}

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

  return <PlaySession key={`${profile.id}:${profile.grade}:${levelNumber}`} profile={profile} level={level} />;
}
