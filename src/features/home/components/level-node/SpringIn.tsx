/** Springs its children in on mount (used by the unlocked coin face and the "Play" pill). */

import { useEffect, type ReactNode } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";

import { SPRING } from "@/features/home/components/level-node/constants";

/** Springs in from `scale` / `y` on mount (or just fades when reduced). `animate=false` renders at rest. */
export default function SpringIn({
  animate,
  reduce,
  from,
  delay,
  style,
  children,
}: Readonly<{
  animate: boolean;
  reduce: boolean;
  from: { scale: number; y: number };
  delay: number;
  style?: object;
  children: ReactNode;
}>) {
  const fade = animate && reduce;
  const spring = animate && !reduce;
  const opacity = useSharedValue(fade ? 0 : 1);
  const scale = useSharedValue(spring ? from.scale : 1);
  const y = useSharedValue(spring ? from.y : 0);
  useEffect(() => {
    if (fade) opacity.set(withTiming(1, { duration: 200 }));
    if (spring) {
      scale.set(withDelay(delay, withSpring(1, SPRING)));
      y.set(withDelay(delay, withSpring(0, SPRING)));
    }
    // mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animated = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }, { scale: scale.value }],
  }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}
