/**
 * Shared types of the Grade 1 ten-frame module (caps, motion, layout, view state).
 */

import type { ReduceMotion, SharedValue } from "react-native-reanimated";

export type CapColor = "teal" | "purple";
export type PaletteKey = CapColor | "gold" | "mint";
export type GroupTone = "gold" | "mint" | null;
export type Flight = "snap" | "fly" | "return";
export type FxKind = "wobble" | "pulse" | "bounce" | "invite" | "count";

export interface Pt {
  x: number;
  y: number;
}

export interface Rect4 {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CapMotion {
  x: SharedValue<number>;
  y: SharedValue<number>;
}

export interface FxSignal {
  kind: FxKind;
  /** Increments on every new signal so the cap replays even for the same kind. */
  n: number;
  /** "count": the number shown in a bubble above the cap. */
  label?: number;
  /** seconds (as on web) */
  delay: number;
}

export type SpringCfg = { stiffness: number; damping: number; mass: number; reduceMotion: ReduceMotion };

/**
 * How the target card, ten-frame and equation are arranged above the tray:
 *  stack — card, grid, equation in one column (phones, portrait tablets);
 *  side  — card beside the grid, equation below (landscape tablets);
 *  rail  — card + equation in a column beside the grid (short canvases, e.g. landscape phones).
 */
export type Arrangement = "stack" | "side" | "rail";

export interface BoardLayout {
  measured: boolean;
  compact: boolean;
  arrangement: Arrangement;
  pad: number;
  cell: number;
  cap: number;
  gap: number;
  frameBorder: number;
  framePad: number;
  trayCols: 5 | 10;
  trayGap: number;
  trayBorder: number;
  trayPad: number;
  sectionGap: number;
  /** Target card: width (side variant) / height (pill variant), mini ten-frame dot and numeral sizes. */
  cardW: number;
  cardH: number;
  dot: number;
  numeral: number;
  /** Equation strip height and digit size. */
  eqH: number;
  eqFont: number;
}

/** Everything around the ten-frame, from snug (room = 0) to roomy (room = 1). */
export interface Chrome {
  sectionGap: number;
  cardH: number;
  dot: number;
  numeral: number;
  eqH: number;
  eqFont: number;
}

/** Where every block sits inside the board (the web's flex layout, done by hand so hit-testing is pure maths). */
export interface Geometry {
  grid: Rect4;
  tray: Rect4;
  card: Rect4;
  eq: Rect4;
  /** The "Done" button, under the equation. */
  done: Rect4;
  slots: Pt[];
  homes: Pt[];
}

export interface DragShared {
  /** Id of the cap under a finger (−1 = none). One drag at a time. */
  active: SharedValue<number>;
  near: SharedValue<boolean>;
  grid: SharedValue<Rect4>;
}

export type WellMode = "plain" | "palTop" | "palDrop" | "palLocked";

export type TileTone = "plain" | "gold" | "mint" | "total" | "win" | "five" | "ask";
