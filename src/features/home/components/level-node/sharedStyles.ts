/** Styles shared by several level-stop pieces (rings, platform face content, numbers). */

import { StyleSheet } from "react-native";

import { fonts } from "@/theme";

export const sharedStyles = StyleSheet.create({
  ring: { position: "absolute", top: -7, left: -7, right: -7, bottom: -7 },
  faceContent: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", gap: 2 },
  num: { fontFamily: fonts.headingBold, includeFontPadding: false },
});
