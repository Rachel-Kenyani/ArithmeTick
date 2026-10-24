/**
 * PlayTopBar — slim top bar: Back to map · level chip · stars · screen time · mute.
 */

import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LevelChipBadge from "@/features/play/components/LevelChipBadge";
import MuteToggle from "@/features/play/components/MuteToggle";
import StarsPill from "@/features/play/components/StarsPill";
import TimePill from "@/features/play/components/TimePill";
import { pillStyles } from "@/features/play/components/playStyles";
import { gutterFor, levelChipPadding, levelTitleSize, topBarGapFor } from "@/features/play/utils/playFormat";
import BackButton from "@/components/ui/BackButton";
import type { LevelDef } from "@/data/levels";
import { colors, fonts } from "@/theme";

interface PlayTopBarProps {
  level: LevelDef;
  stars: number;
  secondsLeft: number;
  timePaused: boolean;
  muted: boolean;
  reduced: boolean;
  onBack: () => void;
}

export default function PlayTopBar({ level, stars, secondsLeft, timePaused, muted, reduced, onBack }: Readonly<PlayTopBarProps>) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const sm = width >= 640;
  const wide = width >= 420;
  const isQuest = level.kind === "quest";
  // "Physical Quest" is the longest title: ease it down on narrow phones so it never truncates.
  const longTitle = level.title.length > 12;
  const gutter = gutterFor(width);
  const gap = topBarGapFor(width);

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top, paddingLeft: Math.max(gutter, insets.left), paddingRight: Math.max(gutter, insets.right) },
      ]}
    >
      <View style={[styles.bar, { gap }]}>
        <BackButton label="Back to map" onPress={onBack} />

        {/* Level chip — "Level 2 · Count to 6" (two lines on phones) */}
        <View
          style={[
            pillStyles.pill,
            styles.levelChip,
            sm ? styles.levelChipSm : styles.levelChipPhone,
            levelChipPadding(width, isQuest),
          ]}
        >
          {sm ? <LevelChipBadge isQuest={isQuest} /> : null}
          <View
            accessible
            accessibilityRole="header"
            accessibilityLabel={`Level ${level.number}: ${level.title}`}
            style={sm ? styles.titleRow : styles.titleCol}
          >
            <Text style={sm ? styles.levelLabelSm : styles.levelLabel}>
              Level {level.number}
              {sm ? " ·" : ""}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.levelTitle,
                { fontSize: levelTitleSize(width, longTitle), paddingTop: sm ? 0 : 2 },
              ]}
            >
              {level.title}
            </Text>
          </View>
        </View>

        {/* Stars + screen time: stacked on narrow phones, side by side from 420px */}
        <View style={[styles.stats, wide ? styles.statsRow : styles.statsCol]}>
          <StarsPill stars={stars} reduced={reduced} wide={wide} />
          <TimePill secondsLeft={secondsLeft} paused={timePaused} wide={wide} />
        </View>

        <MuteToggle muted={muted} size={sm ? 56 : 52} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { zIndex: 20, flexShrink: 0 },
  bar: { height: 72, width: "100%", maxWidth: 1152, alignSelf: "center", flexDirection: "row", alignItems: "center" },
  levelChip: { height: 56, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 8 },
  levelChipPhone: { flex: 1 },
  levelChipSm: { flexShrink: 1 },
  titleCol: { minWidth: 0, flexShrink: 1, flexDirection: "column" },
  titleRow: { minWidth: 0, flexShrink: 1, flexDirection: "row", alignItems: "baseline", gap: 8 },
  levelLabel: { fontFamily: fonts.headingBold, fontSize: 15, lineHeight: 17, color: "rgba(0,79,74,0.65)" },
  levelLabelSm: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.atTeal },
  levelTitle: { fontFamily: fonts.headingBold, color: colors.atTeal, flexShrink: 1 },

  stats: { marginLeft: "auto", flexShrink: 0 },
  statsCol: { flexDirection: "column", alignItems: "flex-end", gap: 4 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
});
