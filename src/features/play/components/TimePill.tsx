/**
 * TimePill — today's remaining screen time (or "paused" during a Physical Quest).
 */

import { StyleSheet, Text, View } from "react-native";

import { formatClock, spokenTime } from "@/features/play/utils/playFormat";
import { ClockIcon } from "@/components/ui/icons";
import { colors, fonts } from "@/theme";

/** The screen-time pill warms to soft amber in the last two minutes (never red, never ticking). */
const LOW_TIME_SECONDS = 120;

type TimePillState = "low" | "paused" | "normal";

function timePillState(low: boolean, paused: boolean): TimePillState {
  if (low) return "low";
  return paused ? "paused" : "normal";
}

const TIME_TEXT_COLORS: Record<TimePillState, string> = {
  low: "#7a5200",
  paused: colors.atTeal,
  normal: "rgba(0,79,74,0.85)",
};

export default function TimePill({ secondsLeft, paused, wide }: Readonly<{ secondsLeft: number; paused: boolean; wide: boolean }>) {
  const low = !paused && secondsLeft < LOW_TIME_SECONDS;
  const state = timePillState(low, paused);
  const tone = { low: styles.timeLow, paused: styles.timePaused, normal: styles.timeNormal }[state];
  const textColor = TIME_TEXT_COLORS[state];
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={spokenTime(secondsLeft, paused)}
      style={[styles.timePill, wide ? styles.timePillWide : styles.timePillNarrow, tone]}
    >
      <ClockIcon size={16} strokeWidth={2.2} color={textColor} />
      <Text numberOfLines={1} style={[styles.timeText, { color: textColor, fontSize: wide ? 14 : 13 }]}>
        {paused ? "paused" : formatClock(secondsLeft)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  timePill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, borderWidth: 1 },
  timePillNarrow: { height: 28, paddingLeft: 6, paddingRight: 10 },
  timePillWide: { height: 36, paddingLeft: 8, paddingRight: 12 },
  timeLow: { backgroundColor: "rgba(255,231,173,0.95)", borderColor: "#f3c967" },
  timePaused: { backgroundColor: "rgba(235,249,247,0.9)", borderColor: "rgba(255,255,255,0.8)" },
  timeNormal: { backgroundColor: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.7)" },
  timeText: { fontFamily: fonts.bodySemiBold, fontVariant: ["tabular-nums"] },
});
