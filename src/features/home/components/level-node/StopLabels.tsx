/** What hangs below a stop's coin: the "Play" pill and the level title. */

import { StyleSheet, Text, View } from "react-native";

import PlayPill from "@/features/home/components/level-node/PlayPill";
import { ABOVE } from "@/features/home/components/level-node/constants";
import type { LevelStatus } from "@/data/levels";
import { colors, fonts } from "@/theme";

/** Below the coin: the "Play" pill (current) and the level title. */
export default function StopLabels({ status, size, title, reduceMotion }: Readonly<{ status: LevelStatus; size: number; title: string; reduceMotion: boolean }>) {
  return (
    <View
      pointerEvents="none"
      style={[styles.below, { top: ABOVE + size + (status === "current" ? -12 : 8) }]}
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
  title: { marginTop: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2, backgroundColor: "rgba(255,255,255,0.9)" },
  titleText: { fontFamily: fonts.headingBold, fontSize: 15, lineHeight: 19, color: colors.atTeal },
});
