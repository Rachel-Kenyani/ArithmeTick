/**
 * The question as an equation, shown from the start: "5 + ? = 7" (the sum last, the way Grade 1 reads it). The 5 lights up purple when the top
 * row is full (matching the "5" badge); while help is on, the "?" gently pulses as the part to work out.
 * A right answer turns "?" into the missing number and the strip goes gold. It never counts along.
 */

import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { TARGET_TOP } from "../constants";
import { useBreath } from "../hooks/useBreath";
import { styles } from "../styles";
import type { BoardLayout } from "../types";
import { EASE_IN_OUT, keyframes } from "../utils/motion";
import { NumberTile } from "./NumberTile";
import { SPARKLES, Sparkle } from "./Sparkle";

interface EquationStripProps {
  target: number;
  topFull: boolean;
  palActive: boolean;
  solved: boolean;
  layout: BoardLayout;
  reduced: boolean;
}

export function EquationStrip({ target, topFull, palActive, solved, layout: L, reduced }: Readonly<EquationStripProps>) {
  const missing = target - TARGET_TOP;
  // Room inside the pill: the 4px border plus ~10px of breathing space above and below the tiles
  const tile = L.eqH - 28;
  const fontSize = L.eqFont;

  const sc = useSharedValue(1);
  useEffect(() => {
    if (solved && !reduced) sc.set(keyframes([1, 1.09, 1], 600, 200, EASE_IN_OUT));
  }, [solved, reduced, sc]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: sc.get() }] }));
  const ask = useBreath(palActive && !solved && !reduced, 1, 1.12, 1, 900);
  const askStyle = useAnimatedStyle(() => ({ transform: [{ scale: ask.get() }] }));

  const op = (sign: string) => <Text style={[styles.operator, { fontSize, lineHeight: Math.round(fontSize * 1.15) }]}>{sign}</Text>;
  const spoken = solved ? `${TARGET_TOP} plus ${missing} equals ${target}` : `${TARGET_TOP} plus what equals ${target}?`;
  return (
    <View accessible accessibilityLabel={spoken} accessibilityLiveRegion="polite">
      <Animated.View
        style={[
          styles.strip,
          { height: L.eqH, gap: L.compact ? 10 : 14, paddingHorizontal: L.compact ? 18 : 26 },
          solved ? styles.stripSolved : null,
          st,
        ]}
      >
        <NumberTile value={TARGET_TOP} tone={topFull || solved ? "five" : "plain"} size={tile} fontSize={fontSize} />
        {op("+")}
        <Animated.View style={askStyle}>
          <NumberTile value={solved ? missing : "?"} tone={solved ? "win" : "ask"} size={tile} fontSize={fontSize} />
        </Animated.View>
        {op("=")}
        <NumberTile value={target} tone={solved ? "win" : "total"} size={tile} fontSize={fontSize} />
      </Animated.View>
      {solved ? SPARKLES.map((s) => <Sparkle key={`${s.left}:${s.top}`} {...s} />) : null}
    </View>
  );
}
