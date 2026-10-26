/**
 * The screen-time pill explains the purpose of the limit: time away for a practical, hands-on counting break.
 */

import { StyleSheet, Text, View } from "react-native";

import { ClockIcon } from "@/components/ui/icons";
import { LOW_TIME_SECONDS } from "@/features/home/components/header/constants";
import {
  formatLeft,
  spokenLeft,
} from "@/features/home/components/header/format";
import { fonts } from "@/theme";

export default function TimePill({
  secondsLeft,
}: Readonly<{ secondsLeft: number; compact?: boolean }>) {
  const low = secondsLeft < LOW_TIME_SECONDS;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${spokenLeft(secondsLeft)} until a practical counting break`}
      style={[styles.time, low ? styles.timeLow : styles.timeCalm]}
    >
      <View style={[styles.clock]}>
        <ClockIcon
          size={18}
          strokeWidth={2.4}
          color={low ? "#7a5200" : "#006a62"}
        />
      </View>
      <Text
        numberOfLines={1}
        style={[styles.timeText, { color: low ? "#7a5200" : "#00554f" }]}
      >
        Break in {formatLeft(secondsLeft)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  timeCalm: {
    backgroundColor: "rgba(233,250,244,0.96)",
    borderColor: "rgba(0,106,98,0.2)",
  },
  timeLow: {
    backgroundColor: "rgba(255,231,173,0.95)",
    borderColor: "#f3c967",
  },
  clock: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  timeText: {
    flexShrink: 1,
    fontFamily: fonts.headingBold,
    fontSize: 15,
    fontVariant: ["tabular-nums"],
  },
});
