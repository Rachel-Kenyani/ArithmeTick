/**
 * Fade + slide-up entrance for the Welcome card.
 */

import { useEffect, type ReactNode } from "react";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { SPRING } from "../utils/welcomeMotion";

export default function SlideUp({ children }: Readonly<{ children: ReactNode }>) {
  const reduce = useReducedMotion();
  const t = useSharedValue(reduce ? 1 : 0);
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.set(withDelay(100, withTiming(1, { duration: 300 })));
    if (!reduce) t.set(withDelay(100, withSpring(1, SPRING)));
  }, [reduce, t, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: 28 * (1 - t.value) }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}
