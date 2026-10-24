/** The padlock that flies off a stop once it unlocks. */

import { useEffect, type ReactNode } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { easeOut } from "@/features/home/components/level-node/constants";
import { sharedStyles } from "@/features/home/components/level-node/sharedStyles";

/** The padlock + number flying off the coin once, then `onDone`. */
export default function FlyingLock({ size, reduce, onDone, children }: Readonly<{ size: number; reduce: boolean; onDone: () => void; children: ReactNode }>) {
  const t = useSharedValue(0);
  useEffect(() => {
    const ms = reduce ? 200 : 550;
    t.set(withTiming(1, { duration: ms, easing: easeOut }));
    const timer = setTimeout(onDone, ms + 30);
    return () => clearTimeout(timer);
  }, [reduce, t, onDone]);
  const animated = useAnimatedStyle(() =>
    reduce
      ? { opacity: 1 - t.value }
      : {
          opacity: 1 - t.value,
          transform: [
            { translateX: size * 0.2 * t.value },
            { translateY: -size * 0.8 * t.value },
            { rotate: `${28 * t.value}deg` },
            { scale: 1 + 0.35 * t.value },
          ],
        },
  );
  return (
    <Animated.View pointerEvents="none" style={[sharedStyles.faceContent, animated]}>
      {children}
    </Animated.View>
  );
}
