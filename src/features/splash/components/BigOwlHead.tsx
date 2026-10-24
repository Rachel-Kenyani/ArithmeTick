/**
 * Splash intro — the big owl's head (Logo-splash-4-6-7-&-8), drawn inside BigOwl's tilting head layer.
 * `pupils` carries the blink; `wink` closes the right eye in frame 14.
 */

import { type SharedValue, useAnimatedProps } from "react-native-reanimated";
import { Circle, Path, Rect } from "react-native-svg";

import { GOLD, PURPLE, PURPLE_DARK, TEAL } from "../constants";
import { AnimatedG } from "./AnimatedSvg";

export default function BigOwlHead({
  pupilsOpacity,
  winkOpacity,
}: Readonly<{
  pupilsOpacity: SharedValue<number>;
  winkOpacity: SharedValue<number>;
}>) {
  const pupilProps = useAnimatedProps(() => ({ opacity: pupilsOpacity.value }));
  const winkProps = useAnimatedProps(() => ({
    opacity: pupilsOpacity.value * winkOpacity.value,
  }));
  return (
    <>
      <Path
        d="M211.28 107.35C211.28 147.81 172.94 180.61 125.63 180.61C78.33 180.61 39.98 147.81 39.98 107.35C39.98 66.89 78.33 34.1 125.63 34.1C172.94 34.1 211.28 66.89 211.28 107.35Z"
        fill={TEAL}
        stroke="#000"
        strokeWidth={4}
      />
      <Path
        d="M55.19 12.68L92.38 60.02L43.92 61.15Z"
        fill={PURPLE_DARK}
        stroke="#000"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path
        d="M196.63 12.68L159.44 60.02L207.9 61.15Z"
        fill={PURPLE_DARK}
        stroke="#000"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path
        d="M125.63 118.62L108.16 134.97L125.63 162.58L142.54 134.97Z"
        fill={GOLD}
        stroke="#000"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path
        d="M77.73 46.49H174.09L126.19 107.35Z"
        fill={PURPLE}
        stroke="#000"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Rect x={116.62} y={108.48} width={18.03} height={4.51} fill="#000" />
      <Path
        d="M29.84 110.48a2 2 0 0 1 2-2h11.52v4.51H31.84a2 2 0 0 1-2-2Z"
        fill="#000"
      />
      <Path
        d="M222.55 110.48a2 2 0 0 0-2-2h-11.52v4.51h11.52a2 2 0 0 0 2-2Z"
        fill="#000"
      />
      <Circle
        cx={83.93}
        cy={111.3}
        r={27.24}
        fill="#fff"
        stroke="#000"
        strokeWidth={3}
      />
      <Circle
        cx={169.02}
        cy={111.3}
        r={27.24}
        fill="#fff"
        stroke="#000"
        strokeWidth={3}
      />
      <AnimatedG animatedProps={pupilProps}>
        <Circle cx={88.44} cy={111.86} r={12.4} fill="#000" />
        <Circle cx={95.2} cy={105.1} r={5.64} fill="#fff" />
      </AnimatedG>
      <AnimatedG animatedProps={winkProps}>
        <Circle cx={163.95} cy={111.86} r={12.4} fill="#000" />
        <Circle cx={170.71} cy={105.1} r={5.64} fill="#fff" />
      </AnimatedG>
      <Circle
        cx={79.42}
        cy={111.86}
        r={37.95}
        fill="#fff"
        fillOpacity={0.4}
        stroke="#000"
        strokeWidth={3}
      />
      <Circle
        cx={171.84}
        cy={111.86}
        r={37.95}
        fill="#fff"
        fillOpacity={0.4}
        stroke="#000"
        strokeWidth={3}
      />
    </>
  );
}
