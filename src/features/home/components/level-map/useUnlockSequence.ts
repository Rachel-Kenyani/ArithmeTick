import { useEffect, useRef, useState } from "react";

import { sfx } from "@/services/audio";

export type UnlockPhase = "waiting" | "pop" | "hop";

export function useUnlockSequence({
  unlockLevel,
  measured,
  reduceMotion,
  onUnlockDone,
}: Readonly<{ unlockLevel: number | null; measured: boolean; reduceMotion: boolean; onUnlockDone: () => void }>) {
  const [unlock, setUnlock] = useState<{ level: number; phase: UnlockPhase } | null>(() =>
    unlockLevel ? { level: unlockLevel, phase: "waiting" } : null,
  );
  const [unlockSegment] = useState(() => (unlockLevel ? unlockLevel - 2 : -1));
  const [popTick, setPopTick] = useState(0);

  const finishUnlock = useRef(onUnlockDone);
  useEffect(() => {
    finishUnlock.current = onUnlockDone;
  }, [onUnlockDone]);
  const hasUnlock = unlock !== null;
  useEffect(() => {
    if (!measured || !hasUnlock) return;
    const timers = [
      setTimeout(() => {
        setUnlock((u) => (u ? { ...u, phase: "pop" } : u));
        setPopTick((t) => t + 1);
        sfx.groupPulse();
      }, reduceMotion ? 250 : 750),
      setTimeout(() => {
        setUnlock((u) => (u ? { ...u, phase: "hop" } : u));
      }, reduceMotion ? 450 : 1150),
      setTimeout(() => {
        setUnlock(null);
        finishUnlock.current();
      }, reduceMotion ? 700 : 2300),
    ];
    return () => {
      timers.forEach((t) => clearTimeout(t));
      finishUnlock.current();
    };
  }, [measured, hasUnlock, reduceMotion]);

  return { unlock, unlockSegment, popTick };
}
