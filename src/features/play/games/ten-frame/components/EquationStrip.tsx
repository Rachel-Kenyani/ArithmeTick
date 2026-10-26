/**
 * Live equation strip: "5 + 2 = 7" reorders into "7 = 5 + 2" with a layout transition when solved.
 */

import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { LinearTransition, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { styles } from "../styles";
import type { BoardLayout, EqPart, GroupTone } from "../types";
import { EASE_IN_OUT, SPRING_LAYOUT, keyframes } from "../utils/motion";
import { NumberTile } from "./NumberTile";
import { SPARKLES, Sparkle } from "./Sparkle";

const PARTS_LIVE: readonly EqPart[] = ["top", "plus", "bottom", "eq", "total"];
const PARTS_SOLVED: readonly EqPart[] = ["total", "eq", "top", "plus", "bottom"];

interface EquationStripProps {
  top: number;
  bottom: number;
  topTone: GroupTone;
  solved: boolean;
  layout: BoardLayout;
  reduced: boolean;
}

const EQ_LAYOUT = LinearTransition.springify().stiffness(SPRING_LAYOUT.stiffness).damping(SPRING_LAYOUT.damping);

export function EquationStrip({ top, bottom, topTone, solved, layout: L, reduced }: Readonly<EquationStripProps>) {
  const total = top + bottom;
  // Room inside the pill: the 4px border plus ~10px of breathing space above and below the tiles
  const tile = L.eqH - 28;
  const fontSize = L.eqFont;
  const order = solved ? PARTS_SOLVED : PARTS_LIVE;

  const sc = useSharedValue(1);
  useEffect(() => {
    if (solved && !reduced) sc.set(keyframes([1, 1.09, 1], 600, 200, EASE_IN_OUT));
  }, [solved, reduced, sc]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: sc.get() }] }));

  const renderPart = (part: EqPart) => {
    switch (part) {
      case "top":
        return <NumberTile value={top} tone={topTone ?? "plain"} size={tile} fontSize={fontSize} />;
      case "bottom":
        return <NumberTile value={bottom} tone="plain" size={tile} fontSize={fontSize} />;
      case "total":
        return <NumberTile value={total} tone={solved ? "win" : "total"} size={tile} fontSize={fontSize} />;
      case "plus":
      case "eq":
        return <Text style={[styles.operator, { fontSize, lineHeight: Math.round(fontSize * 1.15) }]}>{part === "plus" ? "+" : "="}</Text>;
    }
  };

  const spoken = solved ? `${total} equals ${top} plus ${bottom}` : `${top} plus ${bottom} equals ${total}`;
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
        {order.map((part) => (
          <Animated.View key={part} layout={EQ_LAYOUT}>
            {renderPart(part)}
          </Animated.View>
        ))}
      </Animated.View>
      {solved ? SPARKLES.map((s) => <Sparkle key={`${s.left}:${s.top}`} {...s} />) : null}
    </View>
  );
}
