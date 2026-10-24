/**
 * Equation-strip number tile; a new value pops its digit in.
 */

import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";

import { colors } from "@/theme";

import { styles } from "../styles";
import type { TileTone } from "../types";
import { clamp } from "../utils/math";
import { RM, SPRING_POP } from "../utils/motion";

const TILE_TONES: Record<TileTone, { border: string; bg: string; fg: string }> = {
  gold: { border: "#E0A800", bg: colors.atYellow, fg: colors.atInk },
  mint: { border: "#3FD3A3", bg: colors.atGlow, fg: colors.atInk },
  total: { border: "rgba(0,79,74,0.3)", bg: colors.atTeal, fg: colors.white },
  win: { border: "#E0A800", bg: colors.atYellow, fg: colors.atInk },
  plain: { border: "rgba(0,79,74,0.15)", bg: colors.white, fg: colors.atInk },
};

/** A value change pops the new digit in (web: key={value}, scale .4 / y 6 → 1 / 0). */
function TileDigit({ value, fontSize, color }: Readonly<{ value: number; fontSize: number; color: string }>) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withSequence(withTiming(0, { duration: 0, reduceMotion: RM }), withSpring(1, SPRING_POP)));
  }, [value, t]);
  const st = useAnimatedStyle(() => {
    const v = t.get();
    return { opacity: clamp(v, 0, 1), transform: [{ translateY: 6 * (1 - v) }, { scale: 0.4 + 0.6 * v }] };
  });
  return <Animated.Text style={[styles.tileText, { fontSize, lineHeight: Math.round(fontSize * 1.15), color }, st]}>{value}</Animated.Text>;
}

export function NumberTile({ value, tone, size, fontSize }: Readonly<{ value: number; tone: TileTone; size: number; fontSize: number }>) {
  const t = TILE_TONES[tone];
  return (
    // minWidth: a two-digit total ("10") widens the tile instead of overflowing it
    <View style={[styles.tile, { minWidth: size, height: size, borderColor: t.border, backgroundColor: t.bg }, tone === "win" ? styles.glowYellow : null]}>
      <TileDigit value={value} fontSize={fontSize} color={t.fg} />
    </View>
  );
}
