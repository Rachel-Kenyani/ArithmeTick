/**
 * Game rules, sizes and timings of the Grade 1 ten-frame module.
 */

export const CAP_COUNT = 10;
export const ROW_SIZE = 5;
/** The 5-group: the top row is always completed first (ten-frame convention). */
export const TARGET_TOP = 5;
export const DEFAULT_TARGET = 7;
export const MIN_TARGET = 6;
export const MAX_TARGET = 10;
/** Drop counts as "near the grid" inside the grid rect inflated by this much. */
export const NEAR_PX = 48;
/** Removing caps this many times is a struggle signal. */
export const STRUGGLE_REMOVALS = 3;
/** Solved flourish length before handing over to the page (onSolved). */
export const SOLVED_HANDOFF_MS = 1150;
export const PAL_FILL_START_MS = 420;
export const PAL_FILL_STAGGER_MS = 170;
export const INVITE_EVERY_MS = 4200;
export const MIN_CELL = 52;
export const MAX_CELL = 124;
export const MIN_CAP = 56;
export const MAX_CAP = 104;
/** Cap diameter ÷ well size: a cap sits snugly in its well. */
export const CAP_RATIO = 0.84;

export const CAP_IDS: readonly number[] = Array.from({ length: CAP_COUNT }, (_, i) => i);
