import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { useBreath } from "../hooks/useBreath";
import { styles } from "../styles";
import { PopIn } from "./PopIn";

function HaloBreath({ reduced, radius }: Readonly<{ reduced: boolean; radius: number }>) {
  const o = useBreath(!reduced, 0.55, 1, 0.9);
  const st = useAnimatedStyle(() => ({ opacity: o.get() }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glowMint, { borderRadius: radius }, st]} />;
}

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
      key={palActive ? "pal" : "five"}
      from={0.94}
      style={[styles.abs, palActive ? styles.haloPal : styles.haloFive, { left, top, width, height, borderRadius: radius }]}
    >
      {palActive ? <HaloBreath reduced={reduced} radius={radius} /> : null}
    </PopIn>
  );
}
