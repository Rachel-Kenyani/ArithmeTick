/**
 * Jaymo mood cross-fade: springs `blend` 0→1 from the previous mood's pose, plus a springy pop.
 */

import { useEffect, useRef } from "react";
import { Easing, useSharedValue, withSequence, withSpring, withTiming, type SharedValue } from "react-native-reanimated";

import { SETTLE_SPRING } from "./eyeConfig";

export function useMoodBlend(
  moodIdx: number,
  reduceMotion: boolean,
  popX: SharedValue<number>,
  popY: SharedValue<number>,
) {
  const moodSV = useSharedValue(moodIdx);
  const prevSV = useSharedValue(moodIdx);
  const blend = useSharedValue(1);

  // Mood change: cross-fade from the old mood's pose, plus a springy pop.
  const lastMood = useRef(moodIdx);
  useEffect(() => {
    if (lastMood.current === moodIdx) return;
    prevSV.set(lastMood.current);
    moodSV.set(moodIdx);
    lastMood.current = moodIdx;
    if (reduceMotion) {
      blend.set(1);
      return;
    }
    blend.set(0);
    blend.set(withSpring(1, SETTLE_SPRING));
    const out = { duration: 140, easing: Easing.out(Easing.quad) };
    popX.set(withSequence(withTiming(1.08, out), withTiming(0.97, out), withTiming(1, out)));
    popY.set(withSequence(withTiming(0.92, out), withTiming(1.04, out), withTiming(1, out)));
  }, [moodIdx, reduceMotion, blend, moodSV, prevSV, popX, popY]);

  return { moodSV, prevSV, blend };
}
