/**
 * The screen-time pill in the home top bar. Deliberately quiet: no ring, no ticking motion, never red — it only
 * warms to a soft amber in the last two minutes.
 */

import { StyleSheet, Text, View } from "react-native";

import { ClockIcon } from "@/components/ui/icons";
import { LOW_TIME_SECONDS } from "@/features/home/components/header/constants";
import { formatLeft, spokenLeft } from "@/features/home/components/header/format";
import { fonts } from "@/theme";

export default function TimePill({ secondsLeft }: Readonly<{ secondsLeft: number }>) {
  const low = secondsLeft < LOW_TIME_SECONDS;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={spokenLeft(secondsLeft)}
      style={[styles.time, low ? styles.timeLow : styles.timeCalm]}
    >
      <ClockIcon size={17} strokeWidth={2.2} color={low ? "#7a5200" : "rgba(0,79,74,0.85)"} />
      <Text numberOfLines={1} style={[styles.timeText, { color: low ? "#7a5200" : "rgba(0,79,74,0.85)" }]}>
        {formatLeft(secondsLeft)} left
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  time: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingLeft: 8,
    paddingRight: 12,
    borderWidth: 1,
  },
  timeCalm: { backgroundColor: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.7)" },
  timeLow: { backgroundColor: "rgba(255,231,173,0.95)", borderColor: "#f3c967" },
  timeText: { fontFamily: fonts.bodySemiBold, fontSize: 14, fontVariant: ["tabular-nums"] },
});
