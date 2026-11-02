import type { Chrome } from "../types";
import { clamp } from "../utils/math";

export function chromeFor(compact: boolean, room: number, cell: number): Chrome {
  const mix = (snug: number, roomy: number) => Math.round(snug + (roomy - snug) * room);
  if (compact) {
    return { sectionGap: mix(10, 26), cardH: mix(60, 100), dot: mix(11, 18), numeral: mix(40, 68), eqH: mix(66, 88), eqFont: mix(24, 32) };
  }
  const eqSnug = clamp(Math.round(cell * 0.56) + 14, 78, 90);
  const eqH = mix(eqSnug, eqSnug + 20);
  return {
    sectionGap: mix(16, 32),
    cardH: mix(76, 104),
    dot: mix(14, 19),
    numeral: mix(54, 72),
    eqH,
    eqFont: Math.round((eqH - 14) * 0.47),
  };
}

export function sideCardFor(cell: number): { w: number; h: number; dot: number; numeral: number } {
  const dot = clamp(Math.round(cell * 0.2), 14, 24);
  const numeral = clamp(Math.round(cell * 0.95), 52, 112);
  return { w: clamp(Math.round(cell * 1.75), 168, 208), h: numeral + 12 + 2 * dot + 4 + 32 + 8, dot, numeral };
}

export function pillWidth(c: Chrome): number {
  return 8 + 32 + 5 * c.dot + 12 + 12 + Math.ceil(c.numeral * 1.3);
}
export function equationWidth(c: Chrome, compact: boolean): number {
  const tile = c.eqH - 28;
  const wideTile = Math.max(tile, Math.ceil(c.eqFont * 1.3) + 16);
  const operator = Math.ceil(c.eqFont * 0.62) + 4;
  return 8 + 2 * (compact ? 18 : 26) + 2 * tile + wideTile + 2 * operator + 4 * (compact ? 10 : 14);
}
