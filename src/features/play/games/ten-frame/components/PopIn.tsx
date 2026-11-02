import { useEffect, type ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { FadeOut, useAnimatedStyle, useSharedValue, withDelay, withSpring } from "react-native-reanimated";

import type { SpringCfg } from "../types";
import { clamp } from "../utils/math";
import { RM, SPRING_UI } from "../utils/motion";

export function PopIn({
  from = 0,
  rotateFrom = 0,
  delayMs = 0,
  cfg = SPRING_UI,
  style,
  children,
}: Readonly<{
  from?: number;
  rotateFrom?: number;
  delayMs?: number;
  cfg?: SpringCfg;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}>) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(delayMs, withSpring(1, cfg), RM));
  }, [t, delayMs, cfg]);
  const st = useAnimatedStyle(() => {
    const v = t.get();
    return {
      opacity: clamp(v, 0, 1),
      transform: [{ scale: from + (1 - from) * v }, { rotate: `${rotateFrom * (1 - v)}deg` }],
    };
  });
  return (
    <Animated.View pointerEvents="none" exiting={FadeOut.duration(200)} style={[style, st]}>
      {children}
    </Animated.View>
  );
}
