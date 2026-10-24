/**
 * Jaymo choreography types, mood order and per-part rest defaults (plain data so worklets can read it).
 */

import type { JaymoMood } from "./types";

/* ------------------------------------------------------------------------------------------
 * Mood choreography (plain data so worklets can read it)
 * ---------------------------------------------------------------------------------------- */

export type Part =
  | "shadow" | "rig" | "squash" | "head" | "tuftL" | "tuftR" | "wingL" | "wingR"
  | "footL" | "footR" | "beak" | "mouth" | "z0" | "z1" | "z2";
export type AnimKey = "x" | "y" | "rotate" | "scale" | "scaleX" | "scaleY" | "opacity";
export type Pose = Partial<Record<AnimKey, number>>;
export type Keyframes = Partial<Record<AnimKey, number[]>>;
/** "io" easeInOut, "o" easeOut, "i" easeIn. */
export type Ease = "io" | "o" | "i";

export interface Timing {
  /** seconds */
  d: number;
  times?: number[];
  delay?: number;
  ease?: Ease | Ease[];
}

export interface PartMotion {
  rest?: Pose;
  loop?: Keyframes;
  t?: Timing;
}

export type MoodScript = Partial<Record<Part, PartMotion>>;

export const MOODS: readonly JaymoMood[] = ["idle", "wave", "talk", "dance", "cheer", "sleep"];

export const PART_DEFAULTS: Record<Part, Pose> = {
  shadow: { scaleX: 1, opacity: 1 },
  rig: { y: 0, rotate: 0, scaleX: 1 },
  squash: { scaleX: 1, scaleY: 1 },
  head: { rotate: 0 },
  tuftL: { rotate: 0 },
  tuftR: { rotate: 0 },
  wingL: { rotate: 0 },
  wingR: { rotate: 0 },
  footL: { y: 0, rotate: 0 },
  footR: { y: 0, rotate: 0 },
  beak: { y: 0 },
  mouth: { scaleY: 0 },
  z0: { x: 0, y: 0, scale: 0.5, opacity: 0 },
  z1: { x: 0, y: 0, scale: 0.5, opacity: 0 },
  z2: { x: 0, y: 0, scale: 0.5, opacity: 0 },
};
