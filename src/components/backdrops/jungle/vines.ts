/**
 * Canopy vine loops for JungleBackdrop (3 interleaved layers so they sway out of phase).
 */

import { leavesAlong, P, rng, type Pt } from "./geometry";

/* ------------------------------------------------------------------------------------------------
 * Canopy — vine loops along the top (3 interleaved layers so they sway out of phase)
 * ---------------------------------------------------------------------------------------------- */

export const VINE_W = 2000;
export const VINE_H = 132;

export interface VineLayer {
  stems: string;
  leaves: string;
}

function makeVines(seed: number): VineLayer[] {
  const rand = rng(seed);
  const layers: VineLayer[] = [0, 1, 2].map(() => ({ stems: "", leaves: "" }));
  let x = -50;
  let i = 0;
  while (x < VINE_W + 50) {
    const layer = layers[i % 3];
    if (rand() < 0.28) {
      // a single strand hanging straight-ish down
      const len = 58 + rand() * 54;
      const sway = (rand() - 0.5) * 16;
      const p: [Pt, Pt, Pt, Pt] = [[x, -6], [x + sway, len * 0.35], [x - sway, len * 0.7], [x + sway * 0.4, len]];
      layer.stems += `M${P(p[0])}C${P(p[1])} ${P(p[2])} ${P(p[3])}`;
      layer.leaves += leavesAlong(...p, 9, rand, len);
      x += 26 + rand() * 40;
    } else {
      // a drooping loop between two anchors
      const span = 120 + rand() * 150;
      const depth = 34 + rand() * 62;
      const p: [Pt, Pt, Pt, Pt] = [[x, -6], [x + span * 0.06, depth * 1.33], [x + span * 0.94, depth * 1.33], [x + span, -6]];
      layer.stems += `M${P(p[0])}C${P(p[1])} ${P(p[2])} ${P(p[3])}`;
      layer.leaves += leavesAlong(...p, 9.5, rand, span + depth * 1.6);
      // the next one either crosses this loop (a "W") or starts a little further along
      x += rand() < 0.5 ? span * (0.45 + rand() * 0.25) : span + 8 + rand() * 50;
    }
    i++;
  }
  return layers;
}

export const VINES = makeVines(7);
