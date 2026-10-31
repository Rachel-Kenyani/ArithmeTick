/**
 * ArithmeTick design tokens (ported from arithmetick/app/globals.css). Light-only by design:
 * children's shared devices must look the same whatever the OS theme.
 *
 * Fonts: in React Native every weight is its own family — use `fonts.body*` / `fonts.heading*`
 * (never fontWeight with a custom family). Loaded in src/app/_layout.tsx.
 */

import type { ViewStyle } from "react-native";

export const colors = {
  atMint: "#ebf9f7",
  atMintDeep: "#c9efe9",
  atGlow: "#7ff0c9",
  atTeal: "#006f68",
  atTealLight: "#2fa79e",
  atPurple: "#6d41a3",
  atPurpleLight: "#9b75cc",
  atPlum: "#a8326e",
  atYellow: "#ffc107",
  atYellowSoft: "#ffe58a",
  atInk: "#004f4a",
  atCream: "#fffdf6",

  jgSkyTop: "#1f6fb8",
  jgSky: "#4aa3dc",
  jgHaze: "#a8e2e2",
  jgGround: "#cff3ea",
  jgCard: "#eaf8f5",
  jgField: "#a9dfd6",
  jgTeal: "#00968a",
  jgTealEdge: "#006a62",
  jgPurple: "#7e4fcb",
  jgPurpleEdge: "#5a3596",
  jgSun: "#ffd54a",
  jgSunEdge: "#c99a1c",
  jgLeaf: "#6e9a2b",
  jgGrass: "#86c232",
  jgOutline: "#1b1b1b",
  white: "#ffffff",
  black: "#000000",
} as const;

export const fonts = {
  body: "DynaPuff_400Regular",
  bodyMedium: "DynaPuff_500Medium",
  bodySemiBold: "DynaPuff_600SemiBold",
  bodyBold: "DynaPuff_700Bold",
  heading: "Quicksand_400Regular",
  headingMedium: "Quicksand_500Medium",
  headingSemiBold: "Quicksand_600SemiBold",
  headingBold: "Quicksand_700Bold",
} as const;

/** The chunky solid bottom "edge" under buttons (web: box-shadow 0 6px 0 0 <edge>). Drawn as a View, see Button. */
export const edges = {
  teal: "#006a62",
  purple: "#5a3596",
  white: "#b9c4c2",
  sun: "#c99a1c",
} as const;

/** The card's soft drop shadow (web: shadow-card); the white halo ring is drawn as a border in Panel. */
export const cardShadow: ViewStyle = {
  shadowColor: "#003c5a",
  shadowOpacity: 0.3,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 14 },
  elevation: 8,
};

export const spacing = (n: number) => n * 4;
