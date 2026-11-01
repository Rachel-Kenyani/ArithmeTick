/**
 * Splash intro — the frame timeline: Figma's frame-to-frame steps, when each starts, and the easing/spring presets.
 */

import { Easing } from "react-native-reanimated";

/** Reduced-motion timeline (ms). */
/** Reduced motion: when the final scene is up and the wordmark fades back in. */
export const reducedFinaleAt = (t: typeof T) =>
  t.hold1 + 1200 + 300 + t.hold9 + 300 + t.hold10 + 300 + t.hold11 + 300;

export const T = {
  hold1: 900,
  wordOut: 350,
  hold9: 400,
  hold10: 500,
  hold11: 500,
  hold14: 700,
} as const;

type Step = {
  delay: number;
  duration: number;
  easing: "in" | "out" | "inOut";
  spring?: "bouncy" | "gentle";
};
/**
 * Frame n → n+1 transitions (ms). Easings are the Figma prototype's; delays and durations are slowed down from
 * Figma's (300/150, 1/100, 1/300, 150/150, 1/100, 1/200, 1/150, 1/150, 1/200, 1/200, 250/150, 50/150, 1/300) so each
 * frame reads on a phone. A delay counts from the end of the previous transition.
 */
export const STEPS: Step[] = [
  { delay: 800, duration: 350, easing: "in" }, // 1 → 2
  { delay: 150, duration: 250, easing: "in" }, // 2 → 3
  { delay: 150, duration: 450, easing: "out", spring: "bouncy" }, // 3 → 4
  { delay: 300, duration: 90, easing: "inOut" }, // 4 → 5
  { delay: 90, duration: 300, easing: "in" }, // 5 → 6
  { delay: 200, duration: 350, easing: "out" }, // 6 → 7
  { delay: 100, duration: 300, easing: "out", spring: "gentle" }, // 7 → 8
  { delay: 100, duration: 350, easing: "out" }, // 8 → 9
  { delay: 200, duration: 450, easing: "out", spring: "bouncy" }, // 9 → 10
  { delay: 200, duration: 400, easing: "out" }, // 10 → 11
  { delay: 300, duration: 300, easing: "inOut" }, // 11 → 12
  { delay: 200, duration: 350, easing: "inOut" }, // 12 → 13
  { delay: 150, duration: 400, easing: "out", spring: "bouncy" }, // 13 → 14
];
/** When each step starts (ms from mount). */
export const AT = STEPS.reduce<number[]>((starts, step, i) => {
  const prevEnd = i === 0 ? 0 : starts[i - 1] + STEPS[i - 1].duration;
  return [...starts, prevEnd + step.delay];
}, []);
/** Frame 14's payoff: a wink, a sparkle burst and the wordmark bouncing back in, letter by letter. */
export const FINALE_AT = AT[12] + STEPS[12].duration;
export const LETTER_STAGGER = 45;
export const SQUASH_MS = 430;
/** Frame 14 holds this long (covering the payoff) before `onDone` hands over to /welcome. */
export const HOLD_LAST = 1400;
/** Squash-and-stretch hits: the owl landing big (frame 4), the branch arriving (10), the head settling (14). */
export const SQUASH_AT = [
  AT[2] + STEPS[2].duration * 0.5,
  AT[8] + STEPS[8].duration * 0.6,
  AT[12] + STEPS[12].duration * 0.5,
];
/** Figma's ease curves and spring presets. */
export const EASING = {
  in: Easing.in(Easing.cubic),
  out: Easing.out(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
} as const;
export const SPRING = { bouncy: 0.45, gentle: 0.8 } as const;
