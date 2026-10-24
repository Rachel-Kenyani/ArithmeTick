/**
 * Splash intro — one letter of frame 14's returning wordmark.
 */

import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

import { WORD_DOT_Y, type WORD_LETTERS } from "../art/wordmarkArt";
import { FINALE_LOGO, PURPLE, TEAL } from "../constants";
import { LETTER_STAGGER, SPRING } from "../timeline/timeline";

/** One wordmark letter dropping back in for frame 14 (a plain fade under reduced motion). */
export default function FinaleLetter({
  letter,
  index,
  width,
  startAt,
  reduce,
}: Readonly<{
  letter: (typeof WORD_LETTERS)[number];
  index: number;
  width: number;
  startAt: number;
  reduce: boolean;
}>) {
  const progress = useSharedValue(0);
  useEffect(() => {
    const at = startAt + index * LETTER_STAGGER;
    progress.set(
      withDelay(
        at,
        reduce
          ? withTiming(1, { duration: 250 })
          : withSpring(1, { duration: 450, dampingRatio: SPRING.bouncy }),
      ),
    );
  }, [index, progress, reduce, startAt]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, progress.value * 3),
    transform: reduce
      ? []
      : [
          { translateY: (1 - progress.value) * -40 },
          { scale: 0.5 + 0.5 * progress.value },
        ],
  }));
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          transformOrigin: `${((letter.cx + FINALE_LOGO.dx) / FINALE_LOGO.w) * 100}% 50%`,
        },
        style,
      ]}
    >
      <Svg
        width={width}
        height={(width * FINALE_LOGO.h) / FINALE_LOGO.w}
        viewBox={`${-FINALE_LOGO.dx} ${FINALE_LOGO.top} ${FINALE_LOGO.w} ${FINALE_LOGO.h}`}
      >
        <Path d={letter.d} fill={TEAL} />
        {letter.dot ? (
          <Circle cx={letter.dot} cy={WORD_DOT_Y} r={7.04} fill={PURPLE} />
        ) : null}
      </Svg>
    </Animated.View>
  );
}
