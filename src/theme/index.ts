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
  muted: "#5b6664",
  locked: "#6b7775",
  white: "#ffffff",
  black: "#000000",
} as const;

/**
 * Two roles. Display (DynaPuff) is for one screen title, hero titles and big numbers, never below 20px.
 * Text (Quicksand) is for everything people read, at 600 or 700: lighter weights are too thin for early readers.
 */
export const fonts = {
  displaySemiBold: "DynaPuff_600SemiBold",
  displayBold: "DynaPuff_700Bold",
  textSemiBold: "Quicksand_600SemiBold",
  textBold: "Quicksand_700Bold",
} as const;

export const edges = {
  teal: "#006a62",
  purple: "#5a3596",
  white: "#b9c4c2",
  sun: "#c99a1c",
} as const;

export const cardShadow: ViewStyle = {
  shadowColor: "#003c5a",
  shadowOpacity: 0.3,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 14 },
  elevation: 8,
};

export const spacing = (n: number) => n * 4;
