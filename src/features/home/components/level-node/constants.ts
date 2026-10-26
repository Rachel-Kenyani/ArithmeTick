/** Level-stop look and motion constants: platform faces per status, springs, eases and touch-box room. */

import { Easing } from "react-native-reanimated";

import type { LevelStatus } from "@/data/levels";
import { colors } from "@/theme";

export const STATUS_WORD: Record<LevelStatus, string> = { done: "done", current: "play now", locked: "locked" };

/** Platform face per status: fill, state-coloured rim, text colour and chunky bottom edge. */
export const FACE: Record<LevelStatus, { bg: string; border: string; text: string; edge: string; edgeH: number }> = {
  done: { bg: colors.jgSun, border: "#c99a1c", text: colors.jgOutline, edge: "#c99a1c", edgeH: 6 },
  current: { bg: colors.jgTeal, border: "#006a62", text: colors.white, edge: "#006a62", edgeH: 6 },
  // Locked text/lock: #3f6b64 on #d4ece7 ≈ 5:1 (WCAG AA for text and icons); it was #6e9a92 (≈ 2.6:1).
  locked: { bg: "#d4ece7", border: "#78a99f", text: "#3f6b64", edge: "#a5c9c2", edgeH: 5 },
};

export const SPRING = { stiffness: 520, damping: 26 } as const;
export const easeOut = Easing.out(Easing.ease);
export const easeInOut = Easing.inOut(Easing.ease);

/** Room kept inside the touch box above the coin (stars) and below it (Play cue + title). */
export const ABOVE = 30;
export const BELOW = 58;

/** Compact rounded platforms: wider than tall, but still large enough for a clear level number or lock. */
export function platformWidth(size: number) {
  return Math.round(size * 1.18);
}

export function platformHeight(size: number) {
  return Math.round(size * 0.84);
}

export function coinRadius(_isQuest: boolean, _big: boolean, size: number) {
  return Math.round(size * 0.24);
}

export function starSize(tilt: number, big: boolean) {
  if (tilt === 0) return big ? 24 : 21;
  return big ? 19 : 17;
}
