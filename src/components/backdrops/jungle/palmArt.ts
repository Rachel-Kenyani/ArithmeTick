/**
 * Palm frond art for JungleBackdrop corners — procedural crown paths and the two seeded palms.
 */

import { cubic, deg, leaf, leavesAlong, P, rng, towards, type Pt } from "./geometry";

/* ------------------------------------------------------------------------------------------------
 * Canopy — palm fronds in the corners (drawn for the top-left; the right one is mirrored)
 * ---------------------------------------------------------------------------------------------- */

export const PALM_W = 220;
export const PALM_H = 330;

export interface PalmArt {
  trunk: string;
  fanDark: string;
  fanMid: string;
  fronds: [string, string, string];
  ribs: string;
  vineStems: string;
  vineLeaves: string;
}

type FrondSpec = readonly [angleDeg: number, len: number];

/**
 * A palm crown seen from below: a dark spiky fan at the hub, olive fronds arching out from it with long
 * narrow leaflets hanging from both sides (they read as a curtain along the screen edge), and two vines.
 */
function makePalm(seed: number, hub: Pt, fronds: readonly FrondSpec[]): PalmArt {
  const rand = rng(seed);
  const art: PalmArt = {
    trunk: `M${P([hub[0] - 8, -40])}Q${P([hub[0] - 3, hub[1] - 24])} ${P(hub)}`,
    fanDark: "",
    fanMid: "",
    fronds: ["", "", ""],
    ribs: "",
    vineStems: "",
    vineLeaves: "",
  };

  for (const [angleDeg, len] of fronds) {
    const a = deg(angleDeg + (rand() - 0.5) * 8);
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    const p0 = hub;
    const p1: Pt = [hub[0] + ux * len * 0.5, hub[1] + uy * len * 0.5 - len * 0.12];
    const p2: Pt = [hub[0] + ux * len * 0.88, hub[1] + uy * len * 0.88 + len * 0.04];
    const p3: Pt = [hub[0] + ux * len, hub[1] + uy * len + len * 0.3];
    art.ribs += `M${P(p0)}C${P(p1)} ${P(p2)} ${P(p3)}`;
    for (let t = 0.1; t <= 0.98; t += 0.037) {
      const { at, angle } = cubic(p0, p1, p2, p3, t);
      for (const side of [1, -1]) {
        // leaflets fan out from the midrib, then gravity pulls them into a hanging fringe
        const dir = towards(angle + side * deg(70 + rand() * 20), Math.PI / 2, 0.5 + rand() * 0.2);
        const l = (64 + rand() * 40) * (1 - 0.5 * t);
        art.fronds[Math.floor(rand() * 3)] += leaf(at, dir, l, 5.2, true);
      }
    }
  }

  // dark fan-palm burst around the hub (drawn over the frond bases)
  const spikes = 34;
  for (let i = 0; i < spikes; i++) {
    const d = leaf(hub, deg((i * 360) / spikes + (rand() - 0.5) * 8), 42 + rand() * 28, 7, true);
    if (i % 2) art.fanDark += d;
    else art.fanMid += d;
  }

  // two vines dangling from the crown
  for (const [dx, len] of [
    [38, 150 + rand() * 30],
    [74, 196 + rand() * 40],
  ] as const) {
    const top: Pt = [hub[0] + dx, hub[1] + 6];
    const s = 8 + rand() * 8;
    const p: [Pt, Pt, Pt, Pt] = [top, [top[0] + s, top[1] + len * 0.35], [top[0] - s, top[1] + len * 0.7], [top[0] + s * 0.3, top[1] + len]];
    art.vineStems += `M${P(p[0])}C${P(p[1])} ${P(p[2])} ${P(p[3])}`;
    art.vineLeaves += leavesAlong(...p, 9, rand, len);
  }
  return art;
}

export const PALM_LEFT = makePalm(3, [96, 20], [
  [204, 150],
  [178, 175],
  [152, 190],
  [124, 165],
  [100, 120],
  [62, 140],
  [34, 150],
  [8, 120],
]);
export const PALM_RIGHT = makePalm(11, [74, 16], [
  [206, 120],
  [176, 150],
  [146, 185],
  [118, 170],
  [92, 135],
  [58, 165],
  [30, 160],
  [2, 120],
]);

/** The web palm SVG uses overflow: visible; RN SVG clips, so draw into a padded viewBox instead. */
export const PALM_PAD = { l: 120, t: 40, r: 120, b: 40 } as const;
