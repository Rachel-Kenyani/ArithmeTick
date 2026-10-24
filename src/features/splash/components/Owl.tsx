/**
 * Splash intro — the small logo owl of frames 1–3.
 */

import { type SharedValue, useAnimatedProps } from "react-native-reanimated";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import { GOLD, LOGO_W, OWL_H, PURPLE, PURPLE_DARK, TEAL } from "../constants";
import { AnimatedG } from "./AnimatedSvg";

/** The owl (Logo-splash-2-&-3), viewBox 0 0 383 104. `pupils` carries the blink. */
export default function Owl({
  width,
  pupilsOpacity,
}: Readonly<{
  width: number;
  pupilsOpacity: SharedValue<number>;
}>) {
  const pupilProps = useAnimatedProps(() => ({ opacity: pupilsOpacity.value }));
  return (
    <Svg
      width={width}
      height={(width * OWL_H) / LOGO_W}
      viewBox={`0 0 ${LOGO_W} ${OWL_H}`}
    >
      <Path
        d="M238.86 61.65C238.86 84.3 217.4 102.72 190.85 102.72C164.3 102.72 142.83 84.3 142.83 61.65C142.83 39 164.3 20.58 190.85 20.58C217.4 20.58 238.86 39 238.86 61.65Z"
        fill={TEAL}
        stroke="#000"
        strokeWidth={2}
      />
      <Path
        d="M150.54 7.28L171.82 34.47L144.09 35.11Z"
        fill={PURPLE_DARK}
        stroke="#000"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M231.48 7.28L210.19 34.47L237.93 35.11Z"
        fill={PURPLE_DARK}
        stroke="#000"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M190.85 68.12L180.85 77.51L190.85 93.36L200.52 77.51Z"
        fill={GOLD}
        stroke="#000"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M163.44 26.7L218.58 26.7L191.17 61.65Z"
        fill={PURPLE}
        stroke="#000"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Rect x={185.72} y={62.15} width={10.25} height={3.06} fill="#000" />
      <Rect
        x={136}
        y={62.15}
        width={7.85}
        height={3.06}
        rx={1.53}
        fill="#000"
      />
      <Rect
        x={238.49}
        y={62.15}
        width={7.85}
        height={3.06}
        rx={1.53}
        fill="#000"
      />
      <Circle
        cx={166.98}
        cy={63.86}
        r={15.45}
        fill="#fff"
        stroke="#000"
        strokeWidth={2}
      />
      <Circle
        cx={215.68}
        cy={63.86}
        r={15.45}
        fill="#fff"
        stroke="#000"
        strokeWidth={2}
      />
      <AnimatedG animatedProps={pupilProps}>
        <Circle cx={169.56} cy={64.21} r={7.09} fill="#000" />
        <Circle cx={173.43} cy={60.34} r={3.22} fill="#fff" />
        <Circle cx={212.77} cy={64.21} r={7.09} fill="#000" />
        <Circle cx={216.64} cy={60.34} r={3.22} fill="#fff" />
      </AnimatedG>
      <Circle
        cx={164.4}
        cy={64.16}
        r={21.57}
        fill="#fff"
        fillOpacity={0.4}
        stroke="#000"
        strokeWidth={2}
      />
      <Circle
        cx={217.29}
        cy={64.16}
        r={21.57}
        fill="#fff"
        fillOpacity={0.4}
        stroke="#000"
        strokeWidth={2}
      />
    </Svg>
  );
}
