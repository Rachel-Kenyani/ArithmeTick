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
  n: number;
  label?: number;
  delay: number;
}

export type SpringCfg = { stiffness: number; damping: number; mass: number; reduceMotion: ReduceMotion };

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
  cardW: number;
  cardH: number;
  dot: number;
  numeral: number;
  eqH: number;
  eqFont: number;
}

export interface Chrome {
  sectionGap: number;
  cardH: number;
  dot: number;
  numeral: number;
  eqH: number;
  eqFont: number;
}

export interface Geometry {
  grid: Rect4;
  tray: Rect4;
  card: Rect4;
  eq: Rect4;
  done: Rect4;
  slots: Pt[];
  homes: Pt[];
}

export interface DragShared {
  active: SharedValue<number>;
  near: SharedValue<boolean>;
  grid: SharedValue<Rect4>;
}

export type WellMode = "plain" | "palTop" | "palDrop" | "palLocked";

export type TileTone = "plain" | "gold" | "mint" | "total" | "win" | "five" | "ask";
