/**
 * Brijo eye config — per-mood eye kind, lid travel, gaze spots/springs and eye x positions.
 */

import { EYE, LENS } from "./geometry";
import type { BrijoMood } from "./types";

export type EyeKind = "open" | "happy" | "closed";
export const EYES: Record<BrijoMood, EyeKind> = {
  idle: "open",
  wave: "open",
  talk: "open",
  dance: "open",
  cheer: "happy",
  sleep: "closed",
};

export const LID_DROP = EYE.r + 3;
export const LID_RISE = EYE.r - 3;
export const GAZE_SPRING = { stiffness: 260, damping: 22 } as const;
export const SETTLE_SPRING = { stiffness: 300, damping: 24 } as const;
export const GAZE_SPOTS: readonly (readonly [number, number])[] = [
  [0, 0], [-4, 1], [3, 1], [0, -3], [-3, -2], [3, -2], [0, 2.5], [0, 0],
];

export const EYE_X = [LENS.left + EYE.inset, LENS.right - EYE.inset] as const;
export const IRIS_X = [EYE_X[0] + EYE.irisInset, EYE_X[1] - EYE.irisInset] as const;
