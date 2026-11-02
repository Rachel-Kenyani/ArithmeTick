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

export function dimLimits(pz: Puzzle, palActive: boolean): DimLimits {
  return palActive ? { minRows: pz.rows, maxRows: pz.rows, maxCols: pz.cols } : { minRows: 1, maxRows: MAX_ROWS, maxCols: MAX_COLS };
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

export const isTarget = (dims: Dims, pz: Puzzle) => dims.rows === pz.rows && dims.cols === pz.cols;

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
  return { picked: [...picked, ...ordered.sort((a, b) => a - b)], refused: false };
}
