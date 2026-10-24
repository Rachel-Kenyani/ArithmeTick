/** The white pebbles fading in along the trail leg an unlock walks. */

import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { WALKED } from "@/features/home/components/level-map/constants";

/** The unlocking leg's white pebbles, in their own layer so the fade is a View opacity (no animated SVG nodes). */
export default function WalkedLeg({
  width,
  height,
  d,
  strokeWidth,
  visible,
}: Readonly<{
  width: number;
  height: number;
  d: string;
  strokeWidth: number;
  visible: boolean;
}>) {
  const opacity = useSharedValue(visible ? 1 : 0);
  useEffect(() => {
    opacity.set(withTiming(visible ? 1 : 0, { duration: 600 }));
  }, [visible, opacity]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, animated]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", left: 0, top: 0 }}>
        <Path
          d={d}
          fill="none"
          stroke={WALKED}
          strokeWidth={strokeWidth}
          strokeDasharray={[0.1, 17]}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
}
