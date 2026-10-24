/**
 * A floating sleep "z" for Jaymo.
 */

import Animated, { useAnimatedStyle } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { C, Z_PATH } from "./geometry";
import { val, type Rig } from "./sampling";

/** One floating "z" (sleep only): an Animated.View box centred on the z's pivot. */
const Z_BOX = 24;
const Z_PIVOT = [165.5, 55.5] as const;
export const Z_PARTS = ["z0", "z1", "z2"] as const;

export function SleepZ({ part, rig, k, ink }: Readonly<{ part: (typeof Z_PARTS)[number]; rig: Rig; k: number; ink: number }>) {
  const style = useAnimatedStyle(() => ({
    opacity: val(rig, part, "opacity"),
    transform: [
      { translateX: val(rig, part, "x") * k },
      { translateY: val(rig, part, "y") * k },
      { scale: val(rig, part, "scale") },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: (Z_PIVOT[0] - Z_BOX / 2) * k,
          top: (Z_PIVOT[1] - Z_BOX / 2) * k,
          width: Z_BOX * k,
          height: Z_BOX * k,
        },
        style,
      ]}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`${Z_PIVOT[0] - Z_BOX / 2} ${Z_PIVOT[1] - Z_BOX / 2} ${Z_BOX} ${Z_BOX}`}
      >
        <Path
          d={Z_PATH}
          fill="none"
          stroke={C.z}
          strokeWidth={3.4 * ink}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
}
