import { Easing } from "react-native-reanimated";

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
export const STEPS: Step[] = [
  { delay: 800, duration: 350, easing: "in" },
  { delay: 150, duration: 250, easing: "in" },
  { delay: 150, duration: 450, easing: "out", spring: "bouncy" },
  { delay: 300, duration: 90, easing: "inOut" },
  { delay: 90, duration: 300, easing: "in" },
  { delay: 200, duration: 350, easing: "out" },
  { delay: 100, duration: 300, easing: "out", spring: "gentle" },
  { delay: 100, duration: 350, easing: "out" },
  { delay: 200, duration: 450, easing: "out", spring: "bouncy" },
  { delay: 200, duration: 400, easing: "out" },
  { delay: 300, duration: 300, easing: "inOut" },
  { delay: 200, duration: 350, easing: "inOut" },
  { delay: 150, duration: 400, easing: "out", spring: "bouncy" },
];
export const AT = STEPS.reduce<number[]>((starts, step, i) => {
  const prevEnd = i === 0 ? 0 : starts[i - 1] + STEPS[i - 1].duration;
  return [...starts, prevEnd + step.delay];
}, []);
export const FINALE_AT = AT[12] + STEPS[12].duration;
export const LETTER_STAGGER = 45;
export const SQUASH_MS = 430;
export const HOLD_LAST = 1400;
export const SQUASH_AT = [
  AT[2] + STEPS[2].duration * 0.5,
  AT[8] + STEPS[8].duration * 0.6,
  AT[12] + STEPS[12].duration * 0.5,
];
export const EASING = {
  in: Easing.in(Easing.cubic),
  out: Easing.out(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
} as const;
export const SPRING = { bouncy: 0.45, gentle: 0.8 } as const;
