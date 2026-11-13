import { colors } from "@/theme";

export const MAX_ROWS = 5;
export const MAX_COLS = 6;
const DEFAULT_ROWS = 3;
const DEFAULT_COLS = 4;

export const ROW_TONES = [colors.atPlum, colors.atTealLight, colors.atYellow, colors.atPurpleLight] as const;

export interface Puzzle {
  rows: number;
  cols: number;
  count: number;
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

export const LIMITS: DimLimits = { minRows: 1, maxRows: MAX_ROWS, maxCols: MAX_COLS };

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

export function missLine(kind: MissKind, pz: Puzzle): string {
  if (kind === "cols") return `${pz.rows} rows, well done! Now put ${pz.cols} seeds in each row.`;
  if (kind === "rows") return `${pz.cols} seeds in each row, well done! Now make ${pz.rows} rows.`;
  return `Not quite. Brijo needs ${pz.rows} rows, with ${pz.cols} seeds in each row.`;
}


const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function normalizePuzzle(rows = DEFAULT_ROWS, cols = DEFAULT_COLS): Puzzle {
  let r = Math.round(rows);
  let c = Math.round(cols);
  const fits = r >= 2 && r <= ROW_TONES.length && c >= 2 && c <= MAX_COLS;
  if (!fits) {
    r = DEFAULT_ROWS;
    c = DEFAULT_COLS;
  }
  return { rows: r, cols: c, count: r * c };
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


export function answerChoices(pz: Puzzle): number[] {
  const options = new Set([pz.count, pz.rows + pz.cols, pz.count + pz.cols]);
  for (let n = pz.count - pz.cols; options.size < 3; n -= 1) {
    if (n > 0) options.add(n);
  }
  return [...options].sort((a, b) => a - b);
}

export const skipCount = (pz: Puzzle) => Array.from({ length: pz.rows }, (_, r) => (r + 1) * pz.cols).join(", ");

export const showLine = (pz: Puzzle) => `Here are ${pz.rows} rows of ${pz.cols} seeds. Let's count them: ${skipCount(pz)}.`;

export const countLine = "Tap each row to count the seeds.";
export const askLine = (pz: Puzzle) => `How many seeds? ${pz.rows} × ${pz.cols} = ?`;
export const recountLine = (pz: Puzzle) => `Count the rows again: ${skipCount(pz)}. How many seeds?`;
