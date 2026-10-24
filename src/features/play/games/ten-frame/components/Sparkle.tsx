/**
 * Sparkles that burst around the equation strip when the puzzle is solved.
 */

import { useEffect } from "react";
import Animated, { FadeOut, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { styles } from "../styles";
import { RM, keyframes } from "../utils/motion";

export const SPARKLES = [
  { left: "-7%", top: "-20%", size: 18, delay: 300 },
  { left: "20%", top: "-38%", size: 12, delay: 420 },
  { left: "52%", top: "-34%", size: 16, delay: 360 },
  { left: "86%", top: "-24%", size: 13, delay: 500 },
  { left: "101%", top: "38%", size: 15, delay: 460 },
  { left: "-10%", top: "62%", size: 12, delay: 550 },
] as const;

export function Sparkle({ left, top, size, delay }: Readonly<(typeof SPARKLES)[number]>) {
  const s = useSharedValue(0);
  const r = useSharedValue(-30);
  useEffect(() => {
    s.set(keyframes([0, 1.25, 1], 500, delay));
    r.set(withDelay(delay, withTiming(0, { duration: 500, reduceMotion: RM }), RM));
  }, [s, r, delay]);
  const st = useAnimatedStyle(() => ({ opacity: s.get() > 0 ? 1 : 0, transform: [{ scale: s.get() }, { rotate: `${r.get()}deg` }] }));
  return (
    <Animated.View pointerEvents="none" exiting={FadeOut.duration(150)} style={[styles.sparkle, { left, top, width: size, height: size }, st]}>
      <Svg viewBox="0 0 24 24" width={size} height={size}>
        <Path d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z" fill="#FFC107" stroke="#B38600" strokeWidth={1} />
      </Svg>
    </Animated.View>
  );
}
