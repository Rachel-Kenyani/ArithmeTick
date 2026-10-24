/**
 * A ten-frame well (slot): PAL modes, idle hint dimple and the drop preview.
 */

import { memo } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { colors } from "@/theme";

import { useBreath } from "../hooks/useBreath";
import { styles } from "../styles";
import type { WellMode } from "../types";
import { PopIn } from "./PopIn";

interface WellProps {
  index: number;
  x: number;
  y: number;
  size: number;
  radius: number;
  capSize: number;
  mode: WellMode;
  filled: boolean;
  preview: boolean;
  hint: boolean;
  reduced: boolean;
  isNext: boolean;
  onFillNext: () => void;
}

/** Border / fill of a well for its PAL mode and whether a cap sits in it. */
function wellModeStyle(mode: WellMode, filled: boolean): ViewStyle {
  if (mode === "palLocked") return { borderColor: "rgba(255,193,7,0.8)", backgroundColor: "rgba(255,193,7,0.3)" };
  if (mode === "palTop") return { borderColor: colors.atGlow, backgroundColor: "rgba(127,240,201,0.4)" };
  if (mode === "palDrop" && !filled) return { borderColor: "rgba(0,111,104,0.55)", backgroundColor: colors.white, borderStyle: "dashed" };
  if (filled) return { borderColor: "rgba(0,79,74,0.1)", backgroundColor: colors.atMintDeep };
  return { borderColor: "rgba(0,79,74,0.1)", backgroundColor: colors.atMint };
}

function wellStateLabel(mode: WellMode, filled: boolean): string {
  if (filled) return "filled";
  return mode === "palLocked" ? "stays empty" : "empty";
}

export const Well = memo(function Well({
  index,
  x,
  y,
  size,
  radius,
  capSize,
  mode,
  filled,
  preview,
  hint,
  reduced,
  isNext,
  onFillNext,
}: Readonly<WellProps>) {
  const breatheOpacity = mode === "palLocked" && !reduced;
  const breatheScale = mode === "palDrop" && !filled && !reduced;
  const op = useBreath(breatheOpacity, 0.5, 1, mode === "palLocked" ? 0.85 : 1);
  const sc = useBreath(breatheScale, 1, 1.04, 1);
  const st = useAnimatedStyle(() => ({ opacity: op.get(), transform: [{ scale: sc.get() }] }));

  const modeStyle = wellModeStyle(mode, filled);
  const label = `Slot ${index + 1}, ${wellStateLabel(mode, filled)}`;
  return (
    <Animated.View
      accessible
      accessibilityLabel={label}
      accessibilityHint={isNext ? "Double tap to put a bottle cap here" : undefined}
      onAccessibilityTap={isNext ? onFillNext : undefined}
      style={[
        styles.well,
        { left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: radius, zIndex: preview ? 2 : 1 },
        modeStyle,
        st,
      ]}
    >
      {mode === "palLocked" ? (
        <View style={{ width: size * 0.3, height: size * 0.3, borderRadius: size, backgroundColor: "rgba(255,193,7,0.45)" }} />
      ) : (
        <View style={[{ width: capSize * 0.8, height: capSize * 0.8, borderRadius: capSize }, hint ? styles.dimpleHint : styles.dimple]} />
      )}
      {preview ? <WellPreview radius={radius} capSize={capSize} reduced={reduced} /> : null}
    </Animated.View>
  );
});

/** The glowing ring + pulsing ghost cap on the well a held cap will land in. */
function WellPreview({ radius, capSize, reduced }: Readonly<{ radius: number; capSize: number; reduced: boolean }>) {
  const ghost = useBreath(!reduced, 0.92, 1.02, 1, 1100);
  const ghostStyle = useAnimatedStyle(() => ({ transform: [{ scale: ghost.get() }] }));
  return (
    <PopIn from={0.82} style={[styles.preview, { borderRadius: radius + 6 }]}>
      {/* ghost of the cap that is about to land here */}
      <Animated.View style={[styles.ghost, { width: capSize * 0.86, height: capSize * 0.86, borderRadius: capSize }, ghostStyle]} />
    </PopIn>
  );
}
