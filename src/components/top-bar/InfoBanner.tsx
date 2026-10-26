/**
 * InfoBanner — the card under the top bar that says where you are, built like a little name plate:
 * a purple tag sitting on the card's top edge ("Grade 1" / "Level 1"), the big name centred below
 * ("Ten-Frames" / "Count to 6"), and optional progress pips with a "2 of 6" count.
 */

import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { cardShadow, colors, fonts } from "@/theme";

export interface InfoBannerProps {
  /** Small tag on the top edge, e.g. "Level 1". */
  tag: string;
  /** The big centred name, e.g. "Count to 6". */
  title: string;
  /** Screen-reader sentence for the whole card. */
  spoken: string;
  /** Progress pips: `completed` of `total` levels done. */
  progress?: { completed: number; total: number };
  /** A short extra line under the title, e.g. "You did them all!". */
  note?: string;
}

const TAG_H = 28;
const PIP_IDS = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10"] as const;

function pipStyle(index: number, completed: number) {
  if (index < completed) return styles.pipDone;
  return index === completed ? styles.pipNow : styles.pipTodo;
}

export default function InfoBanner({ tag, title, spoken, progress, note }: Readonly<InfoBannerProps>) {
  const { width } = useWindowDimensions();
  const tablet = width >= 640;

  return (
    <View style={[styles.wrap, { paddingHorizontal: tablet ? 24 : 16 }]}>
      <View style={[styles.card, cardShadow]} accessible accessibilityRole="header" accessibilityLabel={spoken}>
        <View style={styles.tag}>
          <Text style={styles.tagText} maxFontSizeMultiplier={1.3}>
            {tag}
          </Text>
        </View>
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} maxFontSizeMultiplier={1.3}>
          {title}
        </Text>
        {progress ? (
          <View style={styles.progress}>
            <View style={styles.pips}>
              {PIP_IDS.slice(0, progress.total).map((id, index) => (
                <View key={id} style={[styles.pip, pipStyle(index, progress.completed)]} />
              ))}
            </View>
            <Text style={styles.count}>
              {progress.completed} of {progress.total}
            </Text>
          </View>
        ) : null}
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Extra top room so the tag can sit half above the card's edge
  wrap: { width: "100%", maxWidth: 512, alignSelf: "center", paddingTop: 12 + TAG_H / 2 },
  card: {
    alignItems: "center",
    gap: 8,
    borderRadius: 24,
    backgroundColor: colors.jgCard,
    paddingTop: TAG_H / 2 + 6,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  tag: {
    position: "absolute",
    top: -TAG_H / 2,
    height: TAG_H,
    justifyContent: "center",
    borderRadius: TAG_H / 2,
    backgroundColor: colors.atPurple,
    borderWidth: 3,
    borderColor: colors.white,
    paddingHorizontal: 14,
  },
  tagText: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.5, color: colors.white },
  title: { fontFamily: fonts.headingBold, fontSize: 26, lineHeight: 30, color: colors.atTeal, textAlign: "center" },
  progress: { flexDirection: "row", alignItems: "center", gap: 10 },
  pips: { flexDirection: "row", alignItems: "center", gap: 4 },
  pip: { height: 10, borderRadius: 999, borderWidth: 1 },
  pipDone: { width: 20, backgroundColor: colors.jgSun, borderColor: "#c99a1c" },
  pipNow: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.white, borderWidth: 4, borderColor: colors.jgTeal },
  pipTodo: { width: 10, backgroundColor: colors.white, borderColor: colors.jgField },
  // #006f68 on the mint card ≈ 6:1
  count: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.atTeal, fontVariant: ["tabular-nums"] },
  note: { fontFamily: fonts.headingBold, fontSize: 17, color: colors.atTeal, textAlign: "center" },
});
