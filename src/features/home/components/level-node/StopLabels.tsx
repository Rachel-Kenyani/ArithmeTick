/** The small lesson label and local Play cue below a reached stop. */

import { StyleSheet, Text, View } from "react-native";

import PlayPill from "@/features/home/components/level-node/PlayPill";
import { ABOVE } from "@/features/home/components/level-node/constants";
import type { LevelStatus } from "@/data/levels";
import { colors, fonts } from "@/theme";

export default function StopLabels({ status, height, title, reduceMotion }: Readonly<{ status: LevelStatus; height: number; title: string; reduceMotion: boolean }>) {
  return (
    <View
      pointerEvents="none"
      style={[styles.below, { top: ABOVE + height + (status === "current" ? -12 : 8) }]}
    >
      {status === "current" ? <PlayPill reduceMotion={reduceMotion} /> : null}
      {/* Titles only on reached stops: locked ones show just the lock + number (the title is still spoken). */}
      {status === "locked" ? null : (
        <View style={styles.title}>
          <Text numberOfLines={1} style={styles.titleText}>
            {title}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  below: { position: "absolute", left: -40, right: -40, alignItems: "center" },
  title: { marginTop: 6, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "rgba(255,255,255,0.9)" },
  titleText: { fontFamily: fonts.headingBold, fontSize: 18, lineHeight: 19, color: colors.atTeal },
});
