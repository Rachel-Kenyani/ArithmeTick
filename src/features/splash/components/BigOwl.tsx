/**
 * Splash intro — the full-size owl (Logo-splash-9): a fading body layer under a tilting head.
 */

import { type SharedValue, useAnimatedProps } from "react-native-reanimated";
import Svg from "react-native-svg";

import { BIG } from "../constants";
import { AnimatedG } from "./AnimatedSvg";
import BigOwlBody from "./BigOwlBody";
import BigOwlHead from "./BigOwlHead";

/** The full-size owl (Logo-splash-9). The body/wings/feet layer fades in for frame 9; `pupils` carries the blink. */
export default function BigOwl({
  unit,
  bodyOpacity,
  pupilsOpacity,
  headTilt,
  winkOpacity,
}: Readonly<{
  unit: number;
  bodyOpacity: SharedValue<number>;
  pupilsOpacity: SharedValue<number>;
  headTilt: SharedValue<number>;
  winkOpacity: SharedValue<number>;
}>) {
  const bodyProps = useAnimatedProps(() => ({ opacity: bodyOpacity.value }));
  // Frames 12–13 turn the head about its own centre (the head ellipse); the body stays put.
  const headProps = useAnimatedProps(() => ({
    rotation: headTilt.value,
    originX: BIG.cx,
    originY: BIG.bodyCy,
  }));
  return (
    <Svg
      width={BIG.w * unit}
      height={BIG.h * unit}
      viewBox={`0 0 ${BIG.w} ${BIG.h}`}
    >
      <AnimatedG animatedProps={bodyProps}>
        <BigOwlBody />
      </AnimatedG>

      <AnimatedG animatedProps={headProps}>
        <BigOwlHead pupilsOpacity={pupilsOpacity} winkOpacity={winkOpacity} />
      </AnimatedG>
    </Svg>
  );
}
