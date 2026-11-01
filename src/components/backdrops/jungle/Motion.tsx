/**
 * Motion wrapper for JungleBackdrop layers — one shared value per layer, transforms on an Animated.View.
 */

import { useEffect, type ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

/* ------------------------------------------------------------------------------------------------
 * Motion — one shared value per layer, transforms on wrapping Animated.Views only
 * ---------------------------------------------------------------------------------------------- */

type MotionKind = "drift" | "sway" | "swing";
const AMPLITUDE: Record<MotionKind, number> = { drift: 14, sway: 1.8, swing: 2.2 };

interface MotionProps {
  kind: MotionKind;
  duration: number;
  /** Starting phase 0..1 (stands in for the web's negative animation-delay). */
  phase?: number;
  reverse?: boolean;
  enabled: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export function Motion({ kind, duration, phase = 0, reverse = false, enabled, style, children }: Readonly<MotionProps>) {
  const t = useSharedValue(0.5);

  useEffect(() => {
    if (!enabled) {
      cancelAnimation(t);
      t.value = 0.5;
      return;
    }
    const from = reverse ? 1 - phase : phase;
    const to = reverse ? 0 : 1;
    const ease = Easing.inOut(Easing.ease);
    t.value = from;
    // first half-leg from the phase offset, then ping-pong forever
    t.value = withTiming(to, { duration: duration * Math.abs(to - from), easing: ease }, (done) => {
      if (done) t.value = withRepeat(withTiming(1 - to, { duration, easing: ease }), -1, true);
    });
    return () => cancelAnimation(t);
  }, [enabled, duration, phase, reverse, t]);

  const animated = useAnimatedStyle(() => {
    const v = (t.value * 2 - 1) * AMPLITUDE[kind];
    if (kind === "drift") return { transform: [{ translateX: v }] };
    if (kind === "sway") return { transform: [{ rotate: `${v}deg` }] };
    return { transform: [{ skewX: `${v}deg` }] };
  });

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}
