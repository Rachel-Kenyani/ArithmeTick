/**
 * Motion presets: springs, easings, keyframe and breathing helpers (framer-style, on Reanimated).
 */

import { Easing, ReduceMotion, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";

import type { Flight, SpringCfg } from "../types";

/**
 * Reduced motion is handled explicitly (as the web does with `reduced` branches), so the
 * animations themselves are never skipped by Reanimated's system setting: a cap must still be
 * seen travelling to its slot.
 */
export const RM = ReduceMotion.Never;
export const spring = (stiffness: number, damping: number): SpringCfg => ({ stiffness, damping, mass: 1, reduceMotion: RM });

export const SPRING_SNAP = spring(500, 30);
export const SPRING_RETURN = spring(380, 28);
// x and y use different springs on long flights so the path bends into a soft arc.
export const SPRING_FLY_X = spring(230, 25);
export const SPRING_FLY_Y = spring(210, 19);

export const SPRING_UI = spring(420, 26);
export const SPRING_POP = spring(520, 20);
export const BREATHE_MS = 2200;
export const EASE_IN_OUT = Easing.inOut(Easing.ease);
export const EASE_OUT = Easing.out(Easing.ease);

export function flightTransition(kind: Flight, axis: "x" | "y"): SpringCfg {
  if (kind === "fly") return axis === "x" ? SPRING_FLY_X : SPRING_FLY_Y;
  if (kind === "return") return SPRING_RETURN;
  return SPRING_SNAP;
}

/** framer-style keyframes: evenly spaced values over `durationMs`, after `delayMs`. */
export function keyframes(values: readonly number[], durationMs: number, delayMs = 0, easing = EASE_OUT) {
  const step = durationMs / Math.max(1, values.length - 1);
  const seq = [
    withTiming(values[0], { duration: 0, reduceMotion: RM }),
    ...values.slice(1).map((v) => withTiming(v, { duration: step, easing, reduceMotion: RM })),
  ];
  return withDelay(delayMs, withSequence(...seq), RM);
}

/** An endless a → b → a breathing loop. */
export function breathe(a: number, b: number, ms = BREATHE_MS) {
  return withSequence(
    withTiming(a, { duration: 0, reduceMotion: RM }),
    withRepeat(
      withSequence(
        withTiming(b, { duration: ms / 2, easing: EASE_IN_OUT, reduceMotion: RM }),
        withTiming(a, { duration: ms / 2, easing: EASE_IN_OUT, reduceMotion: RM }),
      ),
      -1,
      false,
      undefined,
      RM,
    ),
  );
}
