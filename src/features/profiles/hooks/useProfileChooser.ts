import { useEffect, useState } from "react";
import { router } from "expo-router";

import { sfx } from "@/services/audio";
import { MAX_PROFILES, type ChildProfile } from "@/types/models";
import { ROUTES } from "@/constants/routes";
import { actions } from "@/state/store";

import { tileStateFor, type TileState } from "../utils/gridLayout";

const NAV_DELAY_MS = 460;
const NAV_DELAY_REDUCED_MS = 140;

export function useProfileChooser({
  profileCount,
  empty,
  reduceMotion,
}: Readonly<{ profileCount: number; empty: boolean; reduceMotion: boolean }>) {
  const [chosen, setChosen] = useState<string | null>(null);

  useEffect(() => {
    if (empty) router.replace(ROUTES.addExplorer as never);
  }, [empty]);

  useEffect(() => {
    if (!chosen) return;
    const t = setTimeout(
      () => router.push(ROUTES.home as never),
      reduceMotion ? NAV_DELAY_REDUCED_MS : NAV_DELAY_MS,
    );
    return () => clearTimeout(t);
  }, [chosen, reduceMotion]);

  const choose = (child: ChildProfile) => {
    if (chosen) return;
    sfx.groupPulse();
    actions.selectProfile(child.id);
    setChosen(child.id);
  };

  const canAdd = profileCount < MAX_PROFILES;
  const addProfile = () => {
    if (chosen || !canAdd) return;
    sfx.click();
    router.push(ROUTES.addExplorer as never);
  };

  const tileState = (id: string | null): TileState => tileStateFor(chosen, id);

  return { chosen, choose, canAdd, addProfile, tileState };
}
