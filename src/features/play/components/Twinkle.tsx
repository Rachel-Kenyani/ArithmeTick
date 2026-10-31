/**
 * Twinkle — a softly pulsing star dot behind the sleepy Brijo on the screen-time sheet.
 */

import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/theme";

export const TWINKLES = [
  { left: 24, top: 48, size: 10 },
  { left: 64, top: 4, size: 8 },
  { right: 64, top: 12, size: 6 },
  { right: 12, top: 78, size: 8 },
] as const;

export function twinkleKey(pos: (typeof TWINKLES)[number]) {
  const side = "left" in pos ? "l" + pos.left : "r" + pos.right;
  return `${side}-${pos.top}`;
}

export default function Twinkle({ index, reduced, pos }: Readonly<{ index: number; reduced: boolean; pos: (typeof TWINKLES)[number] }>) {
  const opacity = useSharedValue(reduced ? 1 : 0.3);
  useEffect(() => {
    if (reduced) {
      opacity.set(1);
      return;
    }
    const ease = Easing.inOut(Easing.ease);
    opacity.set(
      withDelay(
        index * 800,
        withRepeat(withSequence(withTiming(1, { duration: 1200, easing: ease }), withTiming(0.3, { duration: 1200, easing: ease })), -1),
      ),
    );
  }, [index, reduced, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const { size, ...place } = pos;
  return <Animated.View style={[styles.twinkle, place, { width: size, height: size, borderRadius: size / 2 }, style]} />;
}

const styles = StyleSheet.create({
  twinkle: {
    position: "absolute",
    backgroundColor: colors.white,
    shadowColor: colors.white,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});
