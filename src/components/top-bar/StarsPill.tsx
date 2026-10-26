/** The explorer's star count pill in the top bar. A button only when `onPress` is given (Home → Badges). */

import { Pressable, StyleSheet, Text } from "react-native";

import { StarIcon } from "@/components/ui/icons";
import { colors, fonts } from "@/theme";

export default function StarsPill({ stars, onPress }: Readonly<{ stars: number; onPress?: () => void }>) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={`${stars} stars`}
      accessibilityHint={onPress ? "Win stars by finishing levels. Opens your badges." : undefined}
      hitSlop={6}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.stars, pressed ? styles.pressed : null]}
    >
      <StarIcon size={22} fill="#ffd54a" stroke="#1b1b1b" strokeWidth={1.7} />
      <Text style={styles.starsText}>{stars}</Text>
    </Pressable>
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
    backgroundColor: colors.atPurple,
    paddingLeft: 10,
    paddingRight: 14,
    borderWidth: 2,
    borderColor: "#4a2a75",
    shadowColor: "#4a2a75",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 4 },
  },
  starsText: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.white, fontVariant: ["tabular-nums"] },
  pressed: { transform: [{ scale: 0.96 }] },
});
