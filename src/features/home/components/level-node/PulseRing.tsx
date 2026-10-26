/** Expanding, low-key pulse used only for the current map node. */

import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useEffect } from "react";

export default function PulseRing({ radius }: Readonly<{ radius: number }>) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.set(withRepeat(withTiming(1, { duration: 1800 }), -1, false));
  }, [pulse]);
  const animated = useAnimatedStyle(() => ({ opacity: 0.45 * (1 - pulse.value), transform: [{ scale: 1 + pulse.value * 0.22 }] }));
  return <Animated.View style={[styles.ring, { borderRadius: radius + 8 }, animated]} />;
}

const styles = StyleSheet.create({
  ring: { ...StyleSheet.absoluteFill, borderWidth: 3, borderColor: "rgba(0,106,98,0.45)" },
});
