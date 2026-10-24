/**
 * Target card: the goal numeral and a mini ten-frame of dots that fills with the grid.
 */

import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { ZoomIn, ZoomOut, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { colors } from "@/theme";

import { CAP_IDS, ROW_SIZE } from "../constants";
import { capColor } from "../logic/caps";
import { styles } from "../styles";
import type { BoardLayout, GroupTone, PaletteKey } from "../types";
import { EASE_IN_OUT, SPRING_POP, keyframes } from "../utils/motion";
import { PopIn } from "./PopIn";

interface TargetCardProps {
  variant: "pill" | "side";
  target: number;
  placed: readonly number[];
  topTone: GroupTone;
  solved: boolean;
  layout: BoardLayout;
}

const DOT_FILL: Record<PaletteKey, { bg: string; border: string }> = {
  gold: { bg: colors.atYellow, border: "#C48A00" },
  mint: { bg: colors.atGlow, border: "#2DBE93" },
  purple: { bg: colors.atPurple, border: "#43246C" },
  teal: { bg: colors.atTeal, border: colors.atInk },
};

/** Fill colour of target dot `i`: none while its slot is empty, the group tone for a full top row, else the cap's own colour. */
function dotTone(i: number, placed: readonly number[], topTone: GroupTone): PaletteKey | null {
  if (i >= placed.length) return null;
  if (i < ROW_SIZE && topTone) return topTone;
  return capColor(placed[i]);
}

export function TargetCard({ variant, target, placed, topTone, solved, layout: L }: Readonly<TargetCardProps>) {
  const side = variant === "side";
  const dot = L.dot;
  const dotGap = side ? 4 : 3;
  // Two digits ("10") need a slightly smaller numeral to stay inside the side card.
  const numeral = target >= 10 && side ? Math.round(L.numeral * 0.85) : L.numeral;

  const nScale = useSharedValue(1);
  const nRot = useSharedValue(0);
  useEffect(() => {
    if (!solved) return;
    nScale.set(keyframes([1, 1.28, 1], 700, 250, EASE_IN_OUT));
    nRot.set(keyframes([0, -8, 6, 0], 700, 250, EASE_IN_OUT));
  }, [solved, nScale, nRot]);
  const numStyle = useAnimatedStyle(() => ({ transform: [{ scale: nScale.get() }, { rotate: `${nRot.get()}deg` }] }));

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Goal: make ${target}`}
      style={[
        styles.card,
        side ? { width: L.cardW, flexDirection: "column", gap: 12, padding: 16 } : { height: L.cardH, gap: 12, paddingHorizontal: 16 },
        solved ? styles.cardSolved : null,
      ]}
    >
      {/* target-dot pattern on a mini ten-frame; dots fill as the real grid fills */}
      <View style={{ width: dot * 5 + dotGap * 4, flexDirection: "row", flexWrap: "wrap", gap: dotGap }}>
        {CAP_IDS.map((i) => {
          if (i >= target) {
            return <View key={i} style={{ width: dot, height: dot, borderRadius: 4, backgroundColor: "rgba(0,79,74,0.05)" }} />;
          }
          const tone = dotTone(i, placed, topTone);
          return (
            <View key={i} style={{ width: dot, height: dot }}>
              <View style={[StyleSheet.absoluteFill, styles.dotRing]} />
              {tone ? (
                <Animated.View
                  entering={ZoomIn.springify().stiffness(520).damping(20)}
                  exiting={ZoomOut.duration(150)}
                  style={[StyleSheet.absoluteFill, styles.dotFill, { backgroundColor: DOT_FILL[tone].bg, borderColor: DOT_FILL[tone].border }]}
                />
              ) : null}
            </View>
          );
        })}
      </View>

      <Animated.Text style={[styles.numeral, { fontSize: numeral, lineHeight: Math.round(numeral * 1.1) }, numStyle]}>{target}</Animated.Text>

      {solved ? (
        <PopIn from={0} rotateFrom={-40} delayMs={350} cfg={SPRING_POP} style={styles.tick}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none">
            <Path d="M5 12.5l4.2 4.2L19 7" stroke="#004F4A" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </PopIn>
      ) : null}
    </View>
  );
}
