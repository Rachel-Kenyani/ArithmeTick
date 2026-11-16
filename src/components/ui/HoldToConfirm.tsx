import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { GROWN_UP, InfoIcon } from "@/components/ui/GrownUpNote";
import { sfx } from "@/services/audio";
import { colors, fonts } from "@/theme";

export interface HoldToConfirmProps {
  label: string;
  icon?: ReactNode;
  onConfirm: () => void;
  holdMs?: number;
  /** `danger` is for actions that can't be undone, like deleting the account. */
  tone?: "grownUp" | "danger";
  /** Shows only the icon in a round button. The label is still read out by screen readers. */
  compact?: boolean;
  /** Full-width row with the icon in a badge and a second line under the label, for lists of grown-up actions. */
  hint?: string;
}

export default function HoldToConfirm({ label, icon, onConfirm, holdMs = 2000, tone = "grownUp", compact = false, hint }: Readonly<HoldToConfirmProps>) {
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
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
      accessibilityHint={`Press and hold for ${Math.round(holdMs / 1000)} seconds`}
      onAccessibilityTap={confirm}
      style={[styles.pill, tone === "danger" && styles.dangerPill, compact && styles.compact, hint ? styles.row : null]}
    >
      <Animated.View style={[styles.fill, tone === "danger" && styles.dangerFill, fillStyle]} />
      {hint ? (
        <View style={styles.rowContent}>
          <View style={[styles.badge, tone === "danger" && styles.dangerBadge]}>{icon ?? <InfoIcon />}</View>
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, tone === "danger" && styles.dangerLabel]}>{label}</Text>
            <Text style={[styles.rowHint, tone === "danger" && styles.dangerHint]}>{hint}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          {icon ?? <InfoIcon />}
          {compact ? null : <Text style={[styles.label, tone === "danger" && styles.dangerLabel]}>{label}</Text>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "center",
    minHeight: 48,
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
  label: { fontFamily: fonts.textSemiBold, fontSize: 15, color: GROWN_UP.ink },
  dangerPill: { backgroundColor: colors.danger, borderColor: colors.dangerEdge, borderBottomWidth: 5 },
  dangerFill: { backgroundColor: "rgba(0,0,0,0.25)" },
  dangerLabel: { fontFamily: fonts.textBold, color: colors.white },
  row: { alignSelf: "stretch", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, minHeight: 68 },
  rowContent: { flexDirection: "row", alignItems: "center", gap: 14 },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: GROWN_UP.border,
  },
  dangerBadge: { backgroundColor: "rgba(255,255,255,0.18)", borderColor: "rgba(255,255,255,0.45)" },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontFamily: fonts.textBold, fontSize: 17, color: GROWN_UP.ink },
  rowHint: { fontFamily: fonts.textSemiBold, fontSize: 14, lineHeight: 19, color: GROWN_UP.ink, opacity: 0.8 },
  dangerHint: { color: colors.white, opacity: 0.92 },
  compact: { width: 52, height: 52, minHeight: 52, paddingHorizontal: 0, alignItems: "center" },
});
