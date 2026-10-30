/**
 * Splash intro — frame 10's branch, growing in under Brijo from the left.
 */

import Animated, { type AnimatedStyle } from "react-native-reanimated";
import type { ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";

import { BRANCH_XML } from "../art/frame10Art";

export default function BranchLayer({
  W,
  top,
  unit,
  branchStyle,
}: Readonly<{
  W: number;
  top: number;
  unit: number;
  branchStyle: AnimatedStyle<ViewStyle>;
}>) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: 0,
          top,
          width: W,
          height: 416 * unit,
        },
        branchStyle,
      ]}
    >
      <SvgXml xml={BRANCH_XML} width={W} height={416 * unit} />
    </Animated.View>
  );
}
