/**
 * JungleBackdrop palette — art-only colours, grass tones, sky gradient stops and a clamp helper.
 */

import { colors } from "@/theme";

/* ------------------------------------------------------------------------------------------------
 * Palette (art-only colours with no theme token; sky stops use the jg-* tokens)
 * ---------------------------------------------------------------------------------------------- */

export const C = {
  cloudEdge: "#2e5d96",
  cloudHalo: "#a6d3f2",
  cloudUnder: "#b9d9f3",
  cloudTop: "#f6fbff",
  cloudHatch: "#6f9dcf",
  vine: "#8ca42d",
  vineLeaf: "#a5c23f",
  fanDark: "#1d3617",
  fanMid: "#2d4c20",
  frond: ["#4f6b1b", "#678624", "#7f9c31"] as const,
  rib: "#93a346",
  trunk: "#bdb7a0",
  bladeEdge: "#5a3612",
  rockEdge: "#2c2c2c",
  rock: "#767676",
  rockLight: "#acacac",
  rockDark: "#4b4b4b",
} as const;

/** Grass layers, back → front: [blade body, lit half]. Deep green at the back, bright lime at the front. */
export const GRASS_TONES = [
  ["#3c8611", "#4a9915"],
  ["#4c9c13", "#64b51a"],
  ["#58a814", "#8ad61e"],
] as const;


export const SKY = [colors.jgSkyTop, colors.jgSky, colors.jgHaze, colors.jgGround] as const;
export const SKY_STOPS = [0, 0.36, 0.72, 1] as const;

export const clamp = (min: number, v: number, max: number) => Math.min(max, Math.max(min, v));
