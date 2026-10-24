/**
 * The ★ stars chip on a child tile (or "New" for a brand-new explorer).
 */

import { StyleSheet, Text, View, type TextStyle } from "react-native";

import { SparkleIcon, StarIcon } from "@/components/ui/icons";
import { colors, fonts } from "@/theme";

/** Star count once an explorer has earned some, otherwise a cheerful "New" chip. */
export default function StarsChip({
  stars,
  chipText,
}: Readonly<{
  stars: number;
  chipText: TextStyle;
}>) {
  return stars > 0 ? (
    <View style={[styles.chip, styles.starChip]}>
      <StarIcon size={14} fill="#FFC107" stroke="#b38600" strokeWidth={1.8} />
      <Text style={[styles.chipText, chipText, { color: "#6b4a00" }]}>
        {stars}
      </Text>
    </View>
  ) : (
    <View style={[styles.chip, styles.newChip]}>
      <SparkleIcon size={14} strokeWidth={2.2} color={colors.jgPurple} />
      <Text style={[styles.chipText, chipText, { color: colors.jgPurple }]}>
        New
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingLeft: 6,
    paddingRight: 8,
    borderWidth: 1,
  },
  starChip: {
    backgroundColor: colors.atYellowSoft,
    borderColor: "rgba(255,193,7,0.7)",
  },
  newChip: { backgroundColor: "#f1eafc", borderColor: "rgba(126,79,203,0.3)" },
  chipText: { fontFamily: fonts.bodyBold },
});
