/**
 * Splash intro — frame 10's grass, rising along the bottom of the screen.
 */

import Animated, { type AnimatedStyle } from "react-native-reanimated";
import type { ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";

import { GRASS_XML } from "../art/frame10Art";

export default function GrassLayer({
  W,
  grassH,
  grassStyle,
}: Readonly<{
  W: number;
  grassH: number;
  grassStyle: AnimatedStyle<ViewStyle>;
}>) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: 0,
          bottom: 0,
          width: W,
          height: grassH,
        },
        grassStyle,
      ]}
    >
      <SvgXml xml={GRASS_XML} width={W} height={grassH} />
    </Animated.View>
  );
}
