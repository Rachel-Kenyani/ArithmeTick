/**
 * Splash intro — schedules the whole intro once on mount: the animation timeline (full or reduced motion) and the
 * sound/haptic cues. Calls `onDone` when frame 14 has held; returns `skip` for a tap.
 */

import { useEffect, useRef } from "react";
import { scheduleOnRN } from "react-native-worklets";

import { sfx } from "@/services/audio";

import { splashCues } from "../timeline/cues";
import { startFlourishes } from "../timeline/flourishes";
import { startFullTimeline } from "../timeline/fullTimeline";
import { startReducedTimeline } from "../timeline/reducedTimeline";
import type { SplashValues } from "./useSplashValues";

export function useSplashTimeline({
  values,
  reduce,
  centreShift,
  frame7Y,
  frame8X,
  onDone,
}: Readonly<{
  values: SplashValues;
  reduce: boolean;
  centreShift: number;
  frame7Y: number;
  frame8X: number;
  onDone: () => void;
}>) {
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);
  const cueTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // The timeline's end and a skip tap can both arrive; only the first one leaves.
  const leftRef = useRef(false);
  const leave = () => {
    if (leftRef.current) return;
    leftRef.current = true;
    cueTimers.current.forEach(clearTimeout);
    doneRef.current();
  };
  const skip = () => {
    sfx.sparkle();
    leave();
  };

  useEffect(() => {
    const finish = () => leave();
    const done = (ok?: boolean) => {
      "worklet";
      if (ok) scheduleOnRN(finish);
    };
    if (reduce) {
      startReducedTimeline(values, frame7Y, frame8X, done);
      return;
    }
    startFullTimeline(values, centreShift, frame7Y, frame8X, done);
    startFlourishes(values);

    // Sound and haptics on each beat
    const cues = splashCues();
    const timers = cues.map(([t, cue]) => setTimeout(cue, t));
    cueTimers.current = timers;
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return skip;
}
