/**
 * HoldToConfirm — a quiet grown-up action that only fires after a press-and-hold (2s by default),
 * so a child can't trigger it by tapping. A fill sweeps across the pill while it is held; letting go
 * early resets it. Screen-reader users (who can't hold) confirm with a double tap.
 */

import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { sfx } from "@/services/audio";
import { colors, fonts } from "@/theme";

export interface HoldToConfirmProps {
  label: string;
  icon?: ReactNode;
  onConfirm: () => void;
  holdMs?: number;
}

export default function HoldToConfirm({ label, icon, onConfirm, holdMs = 2000 }: Readonly<HoldToConfirmProps>) {
  const progress = useSharedValue(0);
  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));

  const confirm = () => {
    sfx.click();
    onConfirm();
  };
  const start = () => {
    progress.set(
      withTiming(1, { duration: holdMs }, (finished) => {
        if (finished) scheduleOnRN(confirm);
      }),
    );
  };
  const stop = () => {
    cancelAnimation(progress);
    progress.set(withTiming(0, { duration: 200 }));
  };

  return (
    <Pressable
      onPressIn={start}
      onPressOut={stop}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={`Press and hold for ${Math.round(holdMs / 1000)} seconds`}
      onAccessibilityTap={confirm}
      style={styles.pill}
    >
      <Animated.View style={[styles.fill, fillStyle]} />
      <View style={styles.content}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "center",
    minHeight: 44,
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(0,79,74,0.25)",
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 18,
  },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,111,104,0.22)" },
  content: { flexDirection: "row", alignItems: "center", gap: 8 },
  // #006f68 on the near-white pill ≈ 6:1
  label: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.atPlum },
});
