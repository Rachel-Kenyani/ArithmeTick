/**
 * Halo around the top row: gold 5-group, or the breathing mint PAL glow.
 */

import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { useBreath } from "../hooks/useBreath";
import { styles } from "../styles";
import { PopIn } from "./PopIn";

/** PAL: the mint row glow breathes (steady under reduced motion). */
function HaloBreath({ reduced, radius }: Readonly<{ reduced: boolean; radius: number }>) {
  const o = useBreath(!reduced, 0.55, 1, 0.9);
  const st = useAnimatedStyle(() => ({ opacity: o.get() }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glowMint, { borderRadius: radius }, st]} />;
}

/** 5-group halo (gold) / PAL locked row glow (mint) around the top row. */
export function TopRowHalo({
  palActive,
  reduced,
  left,
  top,
  width,
  height,
  radius,
}: Readonly<{ palActive: boolean; reduced: boolean; left: number; top: number; width: number; height: number; radius: number }>) {
  return (
    <PopIn
      key={palActive ? "pal" : "gold"}
      from={0.94}
      style={[styles.abs, palActive ? styles.haloPal : styles.haloGold, { left, top, width, height, borderRadius: radius }]}
    >
      {palActive ? <HaloBreath reduced={reduced} radius={radius} /> : null}
    </PopIn>
  );
}
