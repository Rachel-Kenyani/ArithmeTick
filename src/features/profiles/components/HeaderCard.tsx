/**
 * Slide-in wrapper for the Profiles title card.
 */

import { useEffect, type ReactNode } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function HeaderCard({
  reduce,
  children,
}: Readonly<{
  reduce: boolean;
  children: ReactNode;
}>) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(reduce ? 0 : -14);
  useEffect(() => {
    if (reduce) {
      opacity.set(withTiming(1, { duration: 200 }));
      return;
    }
    const spring = { stiffness: 340, damping: 28 };
    opacity.set(withSpring(1, spring));
    y.set(withSpring(0, spring));
  }, [reduce, opacity, y]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, opacity.value),
    transform: [{ translateY: y.value }],
  }));
  return (
    <Animated.View
      style={[{ width: "100%", maxWidth: 512, alignSelf: "center" }, style]}
    >
      {children}
    </Animated.View>
  );
}
