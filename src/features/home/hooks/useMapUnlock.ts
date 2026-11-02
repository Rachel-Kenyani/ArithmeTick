import { useEffect, useState } from "react";

import { levelStatus } from "@/data/levels";
import type { Grade } from "@/types/domain";
import { actions, useAppState } from "@/state/store";

export function useMapUnlock(grade: Grade, completed: number, focused: boolean) {
  const { justUnlocked } = useAppState();

  const matching =
    justUnlocked?.grade === grade && levelStatus(justUnlocked.level, completed) === "current"
      ? justUnlocked.level
      : null;
  const staleUnlock = justUnlocked !== null && matching === null;
  useEffect(() => {
    if (staleUnlock) actions.clearJustUnlocked();
  }, [staleUnlock]);

  const unlockLevel = focused ? matching : null;
  const [mapEpoch, setMapEpoch] = useState(0);
  const [prevUnlock, setPrevUnlock] = useState(unlockLevel);
  if (prevUnlock !== unlockLevel) {
    setPrevUnlock(unlockLevel);
    if (unlockLevel !== null && prevUnlock === null) setMapEpoch((e) => e + 1);
  }

  return { unlockLevel, mapEpoch };
}
