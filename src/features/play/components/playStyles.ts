/**
 * Shared play top-bar styling: the white pill and its hard teal edge.
 */

import { StyleSheet } from "react-native";

export const PILL_EDGE = "rgba(0,79,74,0.22)";

export const pillStyles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    shadowColor: PILL_EDGE,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
