/**
 * One star of the sparkle burst around the chosen avatar.
 */

import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { StarIcon } from "@/components/ui/icons";

import { easeOut } from "../utils/easing";

/** Sparkle burst around the chosen avatar: fixed directions (no randomness during render). */
export const SPARKLES = [
  { x: 0, y: -66, color: "#FFC107", size: 18 },
  { x: 56, y: -34, color: "#00968a", size: 14 },
  { x: 58, y: 30, color: "#7e4fcb", size: 16 },
  { x: 0, y: 62, color: "#FFC107", size: 13 },
  { x: -58, y: 30, color: "#00968a", size: 16 },
  { x: -56, y: -34, color: "#7e4fcb", size: 14 },
] as const;

export default function Sparkle({
  s,
  delay,
}: Readonly<{
  s: (typeof SPARKLES)[number];
  delay: number;
}>) {
  const t = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(delay, withTiming(1, { duration: 600, easing: easeOut })));
    scale.set(
      withDelay(
        delay,
        withSequence(
          withTiming(1.2, { duration: 300, easing: easeOut }),
          withTiming(0.7, { duration: 300, easing: easeOut }),
        ),
      ),
    );
    opacity.set(
      withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 300, easing: easeOut }),
          withTiming(0, { duration: 300, easing: easeOut }),
        ),
      ),
    );
  }, [delay, t, scale, opacity]);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: t.value * s.x },
      { translateY: t.value * s.y },
      { scale: scale.value },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: "50%",
          left: "50%",
          marginLeft: -s.size / 2,
          marginTop: -s.size / 2,
        },
        style,
      ]}
    >
      <StarIcon
        size={s.size}
        color={s.color}
        fill="currentColor"
        stroke="none"
      />
    </Animated.View>
  );
}
