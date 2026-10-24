/**
 * StarsPill — the star count, popping on every change.
 */

import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";

import { pillStyles } from "@/features/play/components/playStyles";
import { StarIcon } from "@/components/ui/icons";
import { colors, fonts } from "@/theme";

export default function StarsPill({ stars, reduced, wide }: Readonly<{ stars: number; reduced: boolean; wide: boolean }>) {
  // Web: a keyed motion.span popping from scale 1.5 / y −2 on every change (spring 500 / 14).
  const scale = useSharedValue(1);
  const y = useSharedValue(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    const spring = { stiffness: 500, damping: 14 };
    scale.set(withSequence(withTiming(1.5, { duration: 0 }), withSpring(1, spring)));
    y.set(withSequence(withTiming(-2, { duration: 0 }), withSpring(0, spring)));
  }, [stars, reduced, scale, y]);
  const pop = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }, { scale: scale.get() }] }));

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${stars} stars`}
      style={[pillStyles.pill, styles.starsPill, wide ? styles.starsPillWide : styles.starsPillNarrow]}
    >
      <StarIcon size={wide ? 22 : 20} fill="#ffd54a" stroke="#1b1b1b" strokeWidth={1.7} />
      <Animated.Text style={[styles.starsText, { fontSize: wide ? 20 : 17 }, pop]}>{stars}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  starsPill: { flexDirection: "row", alignItems: "center" },
  starsPillNarrow: { height: 30, gap: 4, paddingLeft: 6, paddingRight: 10 },
  starsPillWide: { height: 40, gap: 6, paddingLeft: 10, paddingRight: 14 },
  starsText: { fontFamily: fonts.headingBold, color: colors.jgOutline, fontVariant: ["tabular-nums"] },
});
