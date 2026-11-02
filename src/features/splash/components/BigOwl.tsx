import { type SharedValue, useAnimatedProps } from "react-native-reanimated";
import Svg from "react-native-svg";

import { BIG } from "../constants";
import { AnimatedG } from "./AnimatedSvg";
import BigOwlBody from "./BigOwlBody";
import BigOwlHead from "./BigOwlHead";

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
