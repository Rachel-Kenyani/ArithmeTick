/**
 * HoldToConfirm — a quiet grown-up action that only fires after a press-and-hold (2s by default),
 * so a child can't trigger it by tapping. A fill sweeps across the pill while it is held; letting go
 * early resets it. Screen-reader users (who can't hold) confirm with a double tap.
 */

import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { GROWN_UP, InfoIcon } from "@/components/ui/GrownUpNote";
import { sfx } from "@/services/audio";
import { fonts } from "@/theme";

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
        {icon ?? <InfoIcon />}
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
    borderColor: GROWN_UP.border,
    backgroundColor: GROWN_UP.bg,
    paddingHorizontal: 18,
  },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: GROWN_UP.fill },
  content: { flexDirection: "row", alignItems: "center", gap: 8 },
  // grown-up voice: plum on light plum (≈ 5.6:1)
  label: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: GROWN_UP.ink },
});
