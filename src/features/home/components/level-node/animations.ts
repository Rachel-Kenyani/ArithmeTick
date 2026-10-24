/** Locked-stop "not yet" nudges (a wobble, or a tiny shake under reduced motion). */

import { type SharedValue, withSequence, withTiming } from "react-native-reanimated";

import { easeInOut } from "@/features/home/components/level-node/constants";

/** A locked stop's "not yet" nudge under reduced motion: a tiny sideways shake. */
export function shakeLocked(shakeX: SharedValue<number>) {
  const seg = (v: number) => withTiming(v, { duration: 80 });
  shakeX.set(withSequence(seg(-2), seg(2), seg(0)));
}

/** A locked stop's "not yet" nudge: a wobble. */
export function wobbleLocked(rot: SharedValue<number>) {
  const seg = (v: number) => withTiming(v, { duration: 100, easing: easeInOut });
  rot.set(withSequence(seg(-10), seg(9), seg(-6), seg(4), seg(0)));
}
