/** The swelling white ring around the stop to play now. */

import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { easeOut } from "@/features/home/components/level-node/constants";
import { sharedStyles } from "@/features/home/components/level-node/sharedStyles";
import { colors } from "@/theme";

/** The white ring that swells and fades around the stop to play (scale 1 → 1.34, 1.7s, 0.25s rest). */
export default function PulseRing({ radius }: Readonly<{ radius: number }>) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1700, easing: easeOut }),
          withDelay(250, withTiming(0, { duration: 0 })),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(t);
  }, [t]);
  const animated = useAnimatedStyle(() => ({
    opacity: 0.9 * (1 - t.value),
    transform: [{ scale: 1 + 0.34 * t.value }],
  }));
  return <Animated.View style={[sharedStyles.ring, styles.pulse, { borderRadius: radius + 7 }, animated]} />;
}

const styles = StyleSheet.create({
  pulse: { borderWidth: 5, borderColor: colors.white },
});
