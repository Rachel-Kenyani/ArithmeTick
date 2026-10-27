/**
 * The number bubble that pops above a cap as it is counted ("1", "2", "3"…) after a wrong "Done".
 */

import { useEffect } from "react";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { styles } from "../styles";
import { keyframes } from "../utils/motion";

/** How long a number stays up before it fades. */
const SHOW_MS = 1400;

export function CountBubble({ label, delayMs, size }: Readonly<{ label: number; delayMs: number; size: number }>) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(keyframes([0, 1, 1, 1, 0], SHOW_MS, delayMs));
  }, [t, delayMs]);
  const st = useAnimatedStyle(() => ({ opacity: t.get(), transform: [{ scale: 0.6 + 0.4 * t.get() }] }));

  const d = Math.round(size * 0.56);
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.countBubble, { width: d, height: d, borderRadius: d, left: (size - d) / 2, top: -d * 0.85 }, st]}
    >
      <Animated.Text style={[styles.countText, { fontSize: Math.round(d * 0.55) }]}>{label}</Animated.Text>
    </Animated.View>
  );
}
