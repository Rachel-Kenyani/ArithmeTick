/**
 * Grass blades + rocks for the JungleBackdrop bottom strip, generated once with a seeded PRNG.
 */

import { P, Q, rng, type Pt } from "./geometry";

/* ------------------------------------------------------------------------------------------------
 * Grass + rocks strip
 * ---------------------------------------------------------------------------------------------- */

export const GRASS_W = 2000;
export const GRASS_H = 150;
const GROUND = GRASS_H + 3; // blade bases sit just below the bottom edge

type GrassLayer = 0 | 1 | 2;

interface Blade {
  body: string;
  lit: string;
  layer: GrassLayer;
}

function blade(x0: number, h: number, w: number, dx: number, layer: GrassLayer): Blade {
  const b = GROUND;
  const tip: Pt = [x0 + dx, b - h];
  // centre line x = x0 + dx·t², y = b − h·t (as a cubic: x controls 0, 0, dx/3, dx); the blade stays wide and
  // then tapers to a point over the last third
  const L: [Pt, Pt, Pt] = [[x0 - w, b], [x0 - w, b - h / 3], [x0 + dx / 3 - w * 0.72, b - (2 * h) / 3]];
  const R: [Pt, Pt, Pt] = [[x0 + w, b], [x0 + w, b - h / 3], [x0 + dx / 3 + w * 0.72, b - (2 * h) / 3]];
  const body = `M${Q(L[0])}C${Q(L[1])} ${Q(L[2])} ${Q(tip)}C${Q(R[2])} ${Q(R[1])} ${Q(R[0])}Z`;
  // the lit half is the outside of the curve; its inner edge doubles as the blade's crease line
  const s = dx >= 0 ? -1 : 1;
  const E = s < 0 ? L : R;
  const V: [Pt, Pt, Pt] = [[x0 + s * w * 0.15, b], [x0 + s * w * 0.15, b - h / 3], [x0 + dx / 3 + s * w * 0.1, b - (2 * h) / 3]];
  const lit = `M${Q(E[0])}C${Q(E[1])} ${Q(E[2])} ${Q(tip)}C${Q(V[2])} ${Q(V[1])} ${Q(V[0])}Z`;
  return { body, lit, layer };
}

interface Rock {
  base: string;
  light: string;
  dark: string;
}

function rock(cx: number, w: number, h: number, tilt: number): Rock {
  const b = GRASS_H + 1;
  const l = cx - w / 2;
  const r = cx + w / 2;
  const top = b - h;
  const pk = cx + tilt * w * 0.2;
  const base = `M${P([l, b])}C${P([l, b - h * 0.62])} ${P([pk - w * 0.34, top])} ${P([pk, top])}C${P([pk + w * 0.36, top])} ${P([r, b - h * 0.55])} ${P([r, b])}Z`;
  const light = `M${P([l + w * 0.1, b - h * 0.3])}C${P([l + w * 0.12, b - h * 0.78])} ${P([pk - w * 0.26, top + h * 0.1])} ${P([pk - w * 0.02, top + h * 0.1])}L${P([pk + w * 0.04, b - h * 0.45])}Z`;
  const dark = `M${P([pk + w * 0.1, b - h * 0.42])}L${P([r - w * 0.07, b - h * 0.45])}C${P([r - w * 0.03, b - h * 0.2])} ${P([r - w * 0.04, b])} ${P([r - w * 0.04, b])}L${P([pk + w * 0.18, b])}Z`;
  return { base, light, dark };
}

function makeGrass(seed: number) {
  const rand = rng(seed);
  const blades: Blade[] = [];
  const rocks: Rock[] = [];

  // fanned clumps: deep green at the back, then the tall middle layer, then short bright tufts in front
  const clumps = (layer: 0 | 1 | 2, step: [number, number], count: [number, number], hRange: [number, number], wRange: [number, number]) => {
    let x = -30 + rand() * step[0];
    while (x < GRASS_W + 30) {
      const n = count[0] + Math.floor(rand() * (count[1] - count[0] + 1));
      const tallest = hRange[0] + rand() * (hRange[1] - hRange[0]);
      for (let i = 0; i < n; i++) {
        const f = n === 1 ? 0.5 : i / (n - 1); // 0 → leans left, 1 → leans right
        const h = tallest * (0.66 + 0.34 * Math.sin(Math.PI * (0.15 + 0.7 * f))) * (0.86 + rand() * 0.18);
        const dx = (f - 0.5) * h * (1 + rand() * 0.45) + (rand() - 0.5) * 14;
        const w = wRange[0] + rand() * (wRange[1] - wRange[0]);
        blades.push(blade(x + (f - 0.5) * n * 7 + (rand() - 0.5) * 6, h, w, dx, layer));
      }
      x += step[0] + rand() * (step[1] - step[0]);
    }
  };
  clumps(0, [22, 40], [2, 3], [34, 58], [7, 10]);
  const turf = blades.splice(0).map((b) => b.body).join("");
  clumps(0, [70, 110], [3, 4], [80, 124], [7, 10]);
  clumps(1, [84, 136], [2, 4], [96, 140], [8, 12]);
  const split = blades.length;
  clumps(2, [120, 200], [2, 3], [44, 82], [6, 8.5]);

  // grey rock clusters sitting in front
  let x = 20 + rand() * 60;
  while (x < GRASS_W) {
    const n = 1 + Math.floor(rand() * 3);
    let cx = x;
    for (let i = 0; i < n; i++) {
      const w = (i === 0 ? 34 : 20) + rand() * 14;
      rocks.push(rock(cx, w, w * (0.5 + rand() * 0.16), rand() - 0.5));
      cx += w * (0.6 + rand() * 0.3);
    }
    x += 130 + rand() * 110;
  }

  return { turf, back: blades.slice(0, split), front: blades.slice(split), rocks };
}

export const GRASS = makeGrass(5);
