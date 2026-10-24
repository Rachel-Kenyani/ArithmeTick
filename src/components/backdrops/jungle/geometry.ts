/**
 * JungleBackdrop geometry helpers — seeded PRNG, path formatting, bezier sampling and leaf shapes.
 */


/* ------------------------------------------------------------------------------------------------
 * Geometry helpers (module-level, pure, deterministic)
 * ---------------------------------------------------------------------------------------------- */

export type Pt = readonly [number, number];

/** mulberry32 — tiny seeded PRNG so the procedural art is identical on server and client. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const r1 = (n: number) => Math.round(n * 10) / 10;
export const P = (p: Pt) => `${r1(p[0])} ${r1(p[1])}`;
/** Whole-unit precision for big, dense artwork (keeps the SSR markup small). */
export const Q = (p: Pt) => `${Math.round(p[0])} ${Math.round(p[1])}`;
export const deg = (d: number) => (d * Math.PI) / 180;

export function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): { at: Pt; angle: number } {
  const u = 1 - t;
  const at: Pt = [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
  const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  return { at, angle: Math.atan2(dy, dx) };
}

/** Rotate angle `a` towards `b` by fraction `k` along the short way round. */
export function towards(a: number, b: number, k: number) {
  let d = b - a;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return a + d * k;
}

/** A slim pointed leaf from `base` towards `angle`; `width` is the bulge control (≈ 2× the real half-width). */
export function leaf(base: Pt, angle: number, len: number, width: number, coarse = false) {
  const F = coarse ? Q : P;
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const tip: Pt = [base[0] + ux * len, base[1] + uy * len];
  const mx = base[0] + ux * len * 0.42;
  const my = base[1] + uy * len * 0.42;
  const c1: Pt = [mx - uy * width, my + ux * width];
  const c2: Pt = [mx + uy * width, my - ux * width];
  return `M${F(base)}Q${F(c1)} ${F(tip)}Q${F(c2)} ${F(base)}Z`;
}

/** Leaves along a cubic, alternating sides, always angled a little downwards (they hang). */
export function leavesAlong(p0: Pt, p1: Pt, p2: Pt, p3: Pt, spacing: number, rand: () => number, approxLen: number) {
  const n = Math.max(3, Math.round(approxLen / spacing));
  let d = "";
  for (let k = 1; k < n; k++) {
    const { at, angle } = cubic(p0, p1, p2, p3, k / n);
    const down = Math.sin(angle) < 0 ? angle + Math.PI : angle; // point along the hang direction
    const side = k % 2 ? 1 : -1;
    d += leaf(at, down + side * deg(46 + rand() * 16), 7.5 + rand() * 3.5, 5);
  }
  return d;
}
