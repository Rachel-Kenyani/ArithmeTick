/** The explorer's star count pill in the home top bar. */

import { StyleSheet, Text, View } from "react-native";

import { StarIcon } from "@/components/ui/icons";
import { CHIP_EDGE } from "@/features/home/components/header/constants";
import { colors, fonts } from "@/theme";

export default function StarsPill({ stars }: Readonly<{ stars: number }>) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`${stars} stars`} style={styles.stars}>
      <StarIcon size={22} fill="#ffd54a" stroke="#1b1b1b" strokeWidth={1.7} />
      <Text style={styles.starsText}>{stars}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // minHeight (not height) so the pills grow with larger accessibility text sizes instead of clipping
  stars: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingLeft: 10,
    paddingRight: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    shadowColor: CHIP_EDGE,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 4 },
  },
  starsText: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.jgOutline, fontVariant: ["tabular-nums"] },
});
