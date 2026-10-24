/**
 * Cloud shapes for JungleBackdrop — puff/base definitions and their silhouette + hatch paths.
 */

import { r1 } from "./geometry";

/* ------------------------------------------------------------------------------------------------
 * Clouds
 * ---------------------------------------------------------------------------------------------- */

type Circle = readonly [cx: number, cy: number, r: number];
type Capsule = readonly [x: number, y: number, w: number, h: number];
export interface CloudDef {
  w: number;
  h: number;
  puffs: Circle[];
  bases: Capsule[];
}

/** Scalloped bottom edge: little bumps along each base capsule. */
function scallops(bases: Capsule[]): Circle[] {
  const out: Circle[] = [];
  for (const [x, y, w, h] of bases) {
    const n = Math.max(2, Math.round((w - 10) / 15));
    for (let i = 0; i <= n; i++) out.push([x + 6 + ((w - 12) * i) / n, y + h - 4, Math.min(8, h * 0.42)]);
  }
  return out;
}

export const CLOUD_BIG: CloudDef = {
  w: 236,
  h: 108,
  puffs: [
    [30, 70, 18],
    [58, 56, 24],
    [96, 42, 32],
    [132, 58, 23],
    [152, 70, 15],
    // two little bubble clouds trailing to the right
    [180, 30, 8],
    [192, 24, 10],
    [204, 31, 7],
    [205, 66, 6],
    [215, 61, 8],
    [225, 66, 5],
  ],
  bases: [
    [14, 62, 152, 28],
    [172, 28, 40, 12],
    [199, 63, 32, 10],
  ],
};

export const CLOUD_WIDE: CloudDef = {
  w: 226,
  h: 100,
  puffs: [
    [24, 74, 11],
    [44, 66, 16],
    [72, 58, 20],
    [104, 50, 24],
    [138, 38, 30],
    [172, 52, 23],
    [198, 66, 15],
  ],
  bases: [[14, 62, 198, 24]],
};

export const CLOUD_SMALL: CloudDef = {
  w: 150,
  h: 84,
  puffs: [
    [30, 54, 16],
    [58, 40, 24],
    [90, 36, 22],
    [116, 50, 16],
  ],
  bases: [[14, 48, 120, 22]],
};

/** The cloud silhouette as ONE path: circles + capsules, all wound clockwise, so nonzero fill = their union. */
export function cloudPath(def: CloudDef) {
  let d = "";
  for (const [cx, cy, r] of [...def.puffs, ...scallops(def.bases)]) {
    d += `M${r1(cx - r)} ${r1(cy)}a${r1(r)} ${r1(r)} 0 1 1 ${r1(2 * r)} 0a${r1(r)} ${r1(r)} 0 1 1 ${r1(-2 * r)} 0Z`;
  }
  for (const [x, y, w, h] of def.bases) {
    const k = h / 2;
    d += `M${r1(x + k)} ${r1(y)}h${r1(w - h)}a${r1(k)} ${r1(k)} 0 0 1 0 ${r1(h)}h${r1(h - w)}a${r1(k)} ${r1(k)} 0 0 1 0 ${r1(-h)}Z`;
  }
  return d;
}

export function cloudHatches(def: CloudDef) {
  let d = "";
  for (const [x, y, w, h] of def.bases) {
    const n = Math.max(1, Math.round(w / 34));
    for (let i = 0; i < n; i++) {
      const hx = x + 14 + ((w - 28) * (i + 0.5)) / n;
      const hy = y + h - 5;
      d += `M${r1(hx)} ${r1(hy)}l2 -3M${r1(hx + 4)} ${r1(hy)}l2 -3`;
    }
  }
  return d;
}
