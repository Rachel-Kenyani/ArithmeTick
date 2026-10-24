/** Level-stop look and motion constants: coin faces per status, springs, eases and touch-box room. */

import { Easing } from "react-native-reanimated";

import type { LevelStatus } from "@/data/levels";
import { colors } from "@/theme";

export const STATUS_WORD: Record<LevelStatus, string> = { done: "done", current: "play now", locked: "locked" };

/** Coin face per status: fill, white rim, text colour, chunky bottom edge. */
export const FACE: Record<LevelStatus, { bg: string; border: string; text: string; edge: string; edgeH: number }> = {
  done: { bg: colors.jgSun, border: colors.white, text: colors.jgOutline, edge: "#c99a1c", edgeH: 6 },
  current: { bg: colors.jgTeal, border: colors.white, text: colors.white, edge: "#006a62", edgeH: 6 },
  // Locked text/lock: #3f6b64 on #d4ece7 ≈ 5:1 (WCAG AA for text and icons); it was #6e9a92 (≈ 2.6:1).
  locked: { bg: "#d4ece7", border: "rgba(255,255,255,0.85)", text: "#3f6b64", edge: "#a5c9c2", edgeH: 5 },
};

export const SPRING = { stiffness: 520, damping: 26 } as const;
export const easeOut = Easing.out(Easing.ease);
export const easeInOut = Easing.inOut(Easing.ease);

/** Room kept inside the touch box above the coin (stars) and below it (Play pill + title). */
export const ABOVE = 30;
export const BELOW = 58;

export function coinRadius(isQuest: boolean, big: boolean, size: number) {
  if (!isQuest) return size / 2;
  return big ? 30 : 26;
}

export function starSize(tilt: number, big: boolean) {
  if (tilt === 0) return big ? 24 : 21;
  return big ? 19 : 17;
}
