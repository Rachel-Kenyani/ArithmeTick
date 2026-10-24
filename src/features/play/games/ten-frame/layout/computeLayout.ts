/**
 * Responsive sizing: picks the arrangement and well / cap sizes that fit the board.
 */

import { CAP_RATIO, MAX_CAP, MAX_CELL, MIN_CAP, MIN_CELL } from "../constants";
import type { Arrangement, BoardLayout, Chrome } from "../types";
import { clamp } from "../utils/math";
import { chromeFor, equationWidth, pillWidth, sideCardFor } from "./chrome";

const ROOM_STEPS: readonly number[] = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0];
/** Below this much height, use the compact metrics even on wide canvases. */
const SHORT_CANVAS_H = 420;
/** The rail needs this much width to stand beside a usable grid. */
const RAIL_MIN_WIDTH = 560;
/** Tie-break when arrangements give the same wells: the familiar ones first. */
const ARRANGEMENT_PREFERENCE: readonly Arrangement[] = ["side", "stack", "rail"];

/**
 * Pick sizes that fit the module width and height (identical maths to web):
 *  1. the biggest wells first (up to MAX_CELL), trying each arrangement that suits the canvas;
 *     the one that fits with the biggest wells wins (if none fits, the shortest one);
 *  2. then any height still spare grows the target card, equation and spacing.
 * Pure: on native `availH` is simply the board container's own height (onLayout).
 */
export function computeLayout(width: number, availH: number): BoardLayout {
  const compact = width < 480 || availH < SHORT_CANVAS_H;
  const wide = width >= 720;
  let pad = 12;
  if (compact) pad = 4;
  else if (wide) pad = 16;
  const gap = compact ? 5 : 10;
  const frameBorder = compact ? 3 : 4;
  const framePad = compact ? 4 : 10;
  const trayGap = compact ? 4 : 10;
  const trayBorder = 4;
  const trayPad = compact ? 5 : 12;

  const inner = Math.max(220, width - pad * 2);
  const frameExtra = 2 * (frameBorder + framePad);
  const trayExtra = 2 * (trayBorder + trayPad);
  const trayCapMax = Math.floor((inner - trayExtra - trayGap * 4) / 5);

  /** Caps keep their snug ratio to the wells: one row of 10 when it fits, else two rows of 5. */
  const trayFor = (cell: number): { cap: number; cols: 5 | 10 } => {
    const cap = clamp(Math.round(cell * CAP_RATIO), MIN_CAP, MAX_CAP);
    if (cap * 10 + trayGap * 9 + trayExtra <= inner) return { cap, cols: 10 };
    return { cap: Math.min(cap, trayCapMax), cols: 5 };
  };

  const gridW = (cell: number) => cell * 5 + gap * 4 + frameExtra;
  const widthFits = (cell: number, a: Arrangement, c: Chrome) => {
    if (a === "side") return gridW(cell) + c.sectionGap + sideCardFor(cell).w <= inner;
    if (a === "rail") return gridW(cell) + c.sectionGap + Math.max(pillWidth(c), equationWidth(c, compact)) <= inner;
    return gridW(cell) <= inner;
  };

  const heightFor = (cell: number, a: Arrangement, c: Chrome) => {
    const { cap, cols } = trayFor(cell);
    const rows = cols === 10 ? 1 : 2;
    const gridH = cell * 2 + gap + frameExtra;
    const trayH = cap * rows + trayGap * (rows - 1) + trayExtra;
    if (a === "side") return pad * 2 + Math.max(gridH, sideCardFor(cell).h) + c.eqH + trayH + c.sectionGap * 2;
    if (a === "rail") return pad * 2 + Math.max(gridH, c.cardH + c.sectionGap + c.eqH) + trayH + c.sectionGap;
    return pad * 2 + c.cardH + gridH + c.eqH + trayH + c.sectionGap * 3;
  };

  /** Biggest wells for one arrangement: as wide as fits, then shrink (not below MIN_CELL) to fit the height. */
  const plan = (arrangement: Arrangement) => {
    const snug = (cell: number) => chromeFor(compact, 0, cell);
    let widest = Math.min(MAX_CELL, Math.floor((inner - frameExtra - gap * 4) / 5));
    while (widest > 1 && !widthFits(widest, arrangement, snug(widest))) widest -= 1;
    const floor = Math.min(MIN_CELL, widest);
    let cell = widest;
    while (cell > floor && heightFor(cell, arrangement, snug(cell)) > availH) cell -= 1;
    const height = heightFor(cell, arrangement, snug(cell));
    return { arrangement, cell, height, fits: height <= availH };
  };

  const plans = [plan("stack")];
  if (wide) plans.push(plan("side"));
  if (width >= RAIL_MIN_WIDTH) plans.push(plan("rail"));
  // Arrangements beside the grid are only worth it when the wells stay a decent size.
  const usable = plans.filter((p) => p.arrangement === "stack" || p.cell >= MIN_CELL);
  const fitting = usable.filter((p) => p.fits);
  const rank = (a: Arrangement) => ARRANGEMENT_PREFERENCE.indexOf(a);
  const best = fitting.length
    ? fitting.reduce((a, b) => (b.cell > a.cell || (b.cell === a.cell && rank(b.arrangement) < rank(a.arrangement)) ? b : a), fitting[0])
    : usable.reduce((a, b) => (b.height < a.height ? b : a), usable[0]);

  const room =
    ROOM_STEPS.find((r) => {
      const c = chromeFor(compact, r, best.cell);
      return widthFits(best.cell, best.arrangement, c) && heightFor(best.cell, best.arrangement, c) <= availH;
    }) ?? 0;
  const chrome = chromeFor(compact, room, best.cell);
  const side = best.arrangement === "side";
  const card = sideCardFor(best.cell);
  const { cap, cols } = trayFor(best.cell);

  return {
    measured: true,
    compact,
    arrangement: best.arrangement,
    pad,
    cell: best.cell,
    cap,
    gap,
    frameBorder,
    framePad,
    trayCols: cols,
    trayGap,
    trayBorder,
    trayPad,
    sectionGap: chrome.sectionGap,
    cardW: side ? card.w : 0,
    cardH: chrome.cardH,
    dot: side ? card.dot : chrome.dot,
    numeral: side ? card.numeral : chrome.numeral,
    eqH: chrome.eqH,
    eqFont: chrome.eqFont,
  };
}

/** First render (before onLayout): a typical 360px phone. */
export const DEFAULT_LAYOUT: BoardLayout = { ...computeLayout(328, 520), measured: false };
