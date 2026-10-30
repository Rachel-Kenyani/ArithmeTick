/**
 * Brijo's head from Logo-splash-4.svg (the splash's frame-4 owl), cropped to the art. `blink` (0–1) hides the
 * pupils; drive it with a shared value for a blink.
 */

import Animated, {
  useAnimatedProps,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";

const AnimatedG = Animated.createAnimatedComponent(G);

/** The artboard area the head occupies (Logo-splash-4 is 428×181; strokes included). */
export const HEAD_VIEW = { x: 116, y: 11, w: 196, h: 171 } as const;

const TEAL = "#009088";
const PURPLE_DARK = "#6D41A3";
const PURPLE = "#884DCF";
const GOLD = "#FEAD1D";

export default function BrijoHeadArt({
  width,
  blink,
}: Readonly<{
  width: number;
  blink?: SharedValue<number>;
}>) {
  const pupilProps = useAnimatedProps(() => ({
    opacity: blink ? 1 - blink.value : 1,
  }));
  return (
    <Svg
      width={width}
      height={(width * HEAD_VIEW.h) / HEAD_VIEW.w}
      viewBox={`${HEAD_VIEW.x} ${HEAD_VIEW.y} ${HEAD_VIEW.w} ${HEAD_VIEW.h}`}
    >
      <Path
        d="M297.29 107.35C297.29 146.98 259.75 179.11 213.44 179.11C167.13 179.11 129.59 146.98 129.59 107.35C129.59 67.73 167.13 35.6 213.44 35.6C259.75 35.6 297.29 67.73 297.29 107.35Z"
        fill={TEAL}
        stroke="#000"
        strokeWidth={3}
      />
      <Path
        d="M143.84 16.1L177.3 58.6L133.9 59.6Z"
        fill={PURPLE_DARK}
        stroke="#000"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path
        d="M283.6 16.1L250.14 58.6L293.54 59.6Z"
        fill={PURPLE_DARK}
        stroke="#000"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path
        d="M213.44 120.7L197.95 135.2L213.44 159.8L228.4 135.2Z"
        fill={GOLD}
        stroke="#000"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path
        d="M168.75 47.99H258.65L214 104.95Z"
        fill={PURPLE}
        stroke="#000"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Rect x={204.51} y={108.22} width={17.85} height={5.34} fill="#000" />
      <Path
        d="M117.93 110.22a2 2 0 0 1 2-2h11.67v5.34H119.93a2 2 0 0 1-2-2Z"
        fill="#000"
      />
      <Path
        d="M310.07 110.22a2 2 0 0 0-2-2h-11.67v5.34h11.67a2 2 0 0 0 2-2Z"
        fill="#000"
      />
      <Circle
        cx={171.89}
        cy={111.2}
        r={27.14}
        fill="#fff"
        stroke="#000"
        strokeWidth={3}
      />
      <Circle
        cx={256.67}
        cy={111.2}
        r={27.14}
        fill="#fff"
        stroke="#000"
        strokeWidth={3}
      />
      <AnimatedG animatedProps={pupilProps}>
        <Circle cx={176.38} cy={111.82} r={12.35} fill="#000" />
        <Circle cx={183.12} cy={105.08} r={5.62} fill="#fff" />
        <Circle cx={251.62} cy={111.82} r={12.35} fill="#000" />
        <Circle cx={258.36} cy={105.08} r={5.62} fill="#fff" />
      </AnimatedG>
      <Circle
        cx={167.39}
        cy={111.72}
        r={37.81}
        fill="#fff"
        fillOpacity={0.4}
        stroke="#000"
        strokeWidth={3}
      />
      <Circle
        cx={259.48}
        cy={111.72}
        r={37.81}
        fill="#fff"
        fillOpacity={0.4}
        stroke="#000"
        strokeWidth={3}
      />
    </Svg>
  );
}
