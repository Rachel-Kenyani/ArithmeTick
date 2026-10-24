/** Which level (if any) the home map should play the unlock sequence for, and the map's remount epoch. */

import { useEffect, useState } from "react";

import { levelStatus } from "@/data/levels";
import type { Grade } from "@/types/domain";
import { actions, useAppState } from "@/state/store";

export function useMapUnlock(grade: Grade, completed: number, focused: boolean) {
  const { justUnlocked } = useAppState();

  // The one-shot hand-off from the play screen: only animate a level of THIS grade that is now the one to play.
  const matching =
    justUnlocked?.grade === grade && levelStatus(justUnlocked.level, completed) === "current"
      ? justUnlocked.level
      : null;
  const staleUnlock = justUnlocked !== null && matching === null;
  useEffect(() => {
    if (staleUnlock) actions.clearJustUnlocked();
  }, [staleUnlock]);

  // Native stacks keep this screen mounted under the play screen, so hold the unlock until the map is on screen
  // again, then remount the map (new key) so it plays the sequence like a fresh visit does on web.
  const unlockLevel = focused ? matching : null;
  const [mapEpoch, setMapEpoch] = useState(0);
  const [prevUnlock, setPrevUnlock] = useState(unlockLevel);
  if (prevUnlock !== unlockLevel) {
    setPrevUnlock(unlockLevel);
    if (unlockLevel !== null && prevUnlock === null) setMapEpoch((e) => e + 1);
  }

  return { unlockLevel, mapEpoch };
}
