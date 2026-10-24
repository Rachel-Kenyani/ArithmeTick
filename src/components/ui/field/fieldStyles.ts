/**
 * Shared field "face" styles + placeholder colour (TextField, PasswordField, SelectField).
 */

import { StyleSheet } from "react-native";

import { colors, fonts } from "@/theme";

/** Shared look of the field "face" — also used by SelectField so both read as one family. */
export const fieldStyles = StyleSheet.create({
  face: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.jgField,
    backgroundColor: colors.white,
    paddingLeft: 22,
    paddingRight: 12,
  },
  focused: { borderColor: colors.jgTeal },
  error: { borderColor: colors.atPlum },
  text: { fontFamily: fonts.headingSemiBold, fontSize: 16, color: "#141414" },
});
export const PLACEHOLDER_COLOR = "#474747";
