/**
 * Tiny worklet-safe maths helpers (clamping, hit-testing).
 */

import type { Rect4 } from "../types";

export function clamp(v: number, lo: number, hi: number): number {
  "worklet";
  return Math.min(hi, Math.max(lo, v));
}

/** Point inside rect `r` inflated by `pad` (board coordinates). */
export function isPointNear(px: number, py: number, r: Rect4, pad: number): boolean {
  "worklet";
  return px >= r.x - pad && px <= r.x + r.w + pad && py >= r.y - pad && py <= r.y + r.h + pad;
}
