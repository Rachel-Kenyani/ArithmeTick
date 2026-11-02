import { useEffect } from "react";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { styles } from "../styles";
import { keyframes } from "../utils/motion";

const SHOW_MS = 1400;

export function CountBubble({ label, delayMs, size }: Readonly<{ label: number; delayMs: number; size: number }>) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(keyframes([0, 1, 1, 1, 0], SHOW_MS, delayMs));
  }, [t, delayMs]);
  const st = useAnimatedStyle(() => ({ opacity: t.get(), transform: [{ scale: 0.6 + 0.4 * t.get() }] }));

  const d = Math.max(30, Math.round(size * 0.56));
  const digits = String(label).length;
  const w = digits > 1 ? Math.round(d * (0.55 + 0.42 * digits)) : d;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.countBubble, { width: w, height: d, borderRadius: d, left: (size - w) / 2, top: -d * 0.85, zIndex: 30 }, st]}
    >
      <Animated.Text style={[styles.countText, { fontSize: Math.round(d * 0.55) }]}>{label}</Animated.Text>
    </Animated.View>
  );
}
