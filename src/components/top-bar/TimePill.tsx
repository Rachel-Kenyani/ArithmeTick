/**
 * TimePill — today's play time left, shown as a clock and "m:ss" (no words for little readers to decode).
 * Warms to soft amber in the last two minutes (never red, never ticking) and reads "Paused" while the
 * clock is stopped, e.g. during a Move & Play level.
 */

import { StyleSheet, Text, View } from "react-native";

import { ClockIcon } from "@/components/ui/icons";
import { LOW_TIME_SECONDS } from "@/components/top-bar/constants";
import { formatLeft, spokenLeft } from "@/components/top-bar/format";
import { fonts } from "@/theme";

export default function TimePill({ secondsLeft, paused = false }: Readonly<{ secondsLeft: number; paused?: boolean }>) {
  const low = !paused && secondsLeft < LOW_TIME_SECONDS;
  const ink = low ? "#7a5200" : "#00554f";
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={paused ? "Play time is paused" : spokenLeft(secondsLeft)}
      style={[styles.time, low ? styles.timeLow : styles.timeCalm]}
    >
      <View style={styles.clock}>
        <ClockIcon size={18} strokeWidth={2.4} color={low ? "#7a5200" : "#006a62"} />
      </View>
      <Text numberOfLines={1} maxFontSizeMultiplier={1.4} style={[styles.timeText, { color: ink }]}>
        {paused ? "Paused" : formatLeft(secondsLeft)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // minHeight (not height) so the pill grows with larger accessibility text sizes instead of clipping
  time: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingLeft: 5,
    paddingRight: 10,
    borderWidth: 2,
    shadowColor: "#00554f",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  timeCalm: { backgroundColor: "rgba(233,250,244,0.96)", borderColor: "rgba(0,106,98,0.2)" },
  timeLow: { backgroundColor: "rgba(255,231,173,0.95)", borderColor: "#f3c967" },
  clock: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  timeText: { flexShrink: 1, fontFamily: fonts.headingBold, fontSize: 15, fontVariant: ["tabular-nums"] },
});
