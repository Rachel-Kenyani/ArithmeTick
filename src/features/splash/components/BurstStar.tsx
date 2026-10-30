/**
 * Splash intro — frame 14's sparkle burst stars.
 */

import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { GOLD } from "../constants";

export const BURST_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const STAR = "M9 0L11.2 6.8L18 9L11.2 11.2L9 18L6.8 11.2L0 9L6.8 6.8Z";

/** One star of frame 14's sparkle burst: flies out from Brijo's head and fades. */
export default function BurstStar({
  progress,
  angle,
  unit,
}: Readonly<{
  progress: SharedValue<number>;
  angle: number;
  unit: number;
}>) {
  const rad = (angle * Math.PI) / 180;
  const size = 18 * unit;
  const style = useAnimatedStyle(() => {
    const radius = unit * (95 + 75 * progress.value);
    return {
      opacity: progress.value <= 0 ? 0 : 1 - progress.value,
      transform: [
        { translateX: Math.cos(rad) * radius - size / 2 },
        { translateY: Math.sin(rad) * radius - size / 2 },
        { scale: 1.4 - 0.6 * progress.value },
        { rotate: `${progress.value * 90}deg` },
      ],
    };
  });
  return (
    <Animated.View
      style={[{ position: "absolute", width: size, height: size }, style]}
    >
      <Svg width={size} height={size} viewBox="0 0 18 18">
        <Path
          d={STAR}
          fill={GOLD}
          stroke="#fff"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
}
