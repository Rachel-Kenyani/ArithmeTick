import { colors } from "@/theme";

export const MAX_ROWS = 5;
export const MAX_COLS = 6;
export const TEN = 10;
const DEFAULT_ROWS = 3;
const DEFAULT_COLS = 4;

export const ROW_TONES = [colors.atPlum, colors.atTealLight, colors.atYellow, colors.atPurpleLight] as const;

export interface Puzzle {
  rows: number;
  cols: number;
  count: number;
  ones: number;
}

export interface Dims {
  rows: number;
  cols: number;
}

export interface DimLimits {
  minRows: number;
  maxRows: number;
  maxCols: number;
}

/** The child can always build any size: help shows where the target is, but never snaps a wrong array into the right one. */
export const LIMITS: DimLimits = { minRows: 1, maxRows: MAX_ROWS, maxCols: MAX_COLS };

/** Misses before Brijo builds the array for the child to count and check. */
export const SHOW_AFTER_MISSES = 2;

export type MissKind = "rows" | "cols" | "both";

export function missKind(dims: Dims, pz: Puzzle): MissKind | null {
  const rowsOk = dims.rows === pz.rows;
  const colsOk = dims.cols === pz.cols;
  if (rowsOk && colsOk) return null;
  if (rowsOk) return "cols";
  if (colsOk) return "rows";
  return "both";
}

/** What Brijo says when the array is wrong: what is right so far, and what to change. */
export function missLine(kind: MissKind, pz: Puzzle): string {
  if (kind === "cols") return `${pz.rows} rows, well done! Now put ${pz.cols} seeds in each row.`;
  if (kind === "rows") return `${pz.cols} seeds in each row, well done! Now make ${pz.rows} rows.`;
  return `Not quite. Brijo needs ${pz.rows} rows, with ${pz.cols} seeds in each row.`;
}

export const showLine = (pz: Puzzle) => `Here are ${pz.rows} rows of ${pz.cols} seeds. Count them, then tap Done.`;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function normalizePuzzle(rows = DEFAULT_ROWS, cols = DEFAULT_COLS): Puzzle {
  let r = Math.round(rows);
  let c = Math.round(cols);
  const fits = r >= 1 && r <= ROW_TONES.length && c >= 1 && c <= MAX_COLS && r * c >= TEN && r * c < 2 * TEN;
  if (!fits) {
    r = DEFAULT_ROWS;
    c = DEFAULT_COLS;
  }
  return { rows: r, cols: c, count: r * c, ones: r * c - TEN };
}

export function dimsAt(x: number, y: number, pitch: number, limits: DimLimits): Dims {
  "worklet";
  const cols = Math.min(limits.maxCols, Math.max(1, Math.ceil(x / pitch)));
  const rows = Math.min(limits.maxRows, Math.max(limits.minRows, Math.ceil(y / pitch)));
  return { rows, cols };
}

export function constrain(dims: Dims, limits: DimLimits): Dims {
  return { rows: clamp(dims.rows, limits.minRows, limits.maxRows), cols: clamp(dims.cols, 1, limits.maxCols) };
}


export interface PickResult {
  picked: number[];
  refused: boolean;
}

export function pickTile(picked: readonly number[], tile: number, cols: number, palActive: boolean): PickResult {
  if (picked.includes(tile)) return { picked: picked.filter((t) => t !== tile), refused: false };
  const room = TEN - picked.length;
  if (room <= 0) return { picked: [...picked], refused: true };
  const row = Math.floor(tile / cols);
  const rowStarted = picked.some((t) => Math.floor(t / cols) === row);
  if (!palActive || rowStarted) return { picked: [...picked, tile], refused: false };
  const rest = Array.from({ length: cols }, (_, c) => row * cols + c).filter((t) => !picked.includes(t));
  const ordered = [tile, ...rest.filter((t) => t !== tile)].slice(0, room);
  return { picked: [...picked, ...ordered.toSorted((a, b) => a - b)], refused: false };
}
