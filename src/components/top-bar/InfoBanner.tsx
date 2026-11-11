import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { SpeechIcon } from "@/components/ui/icons";
import { cardShadow, colors, fonts } from "@/theme";

export interface InfoBannerProps {
  tag: string;
  title: string;
  spoken: string;
  progress?: { completed: number; total: number };
  onReplay?: () => void;
}

const TAG_H = 28;
const PIP_IDS = [
  "p1",
  "p2",
  "p3",
  "p4",
  "p5",
  "p6",
  "p7",
  "p8",
  "p9",
  "p10",
] as const;

function pipStyle(index: number, completed: number) {
  if (index < completed) return styles.pipDone;
  return index === completed ? styles.pipNow : styles.pipTodo;
}

export default function InfoBanner({
  tag,
  title,
  spoken,
  progress,
  onReplay,
}: Readonly<InfoBannerProps>) {
  const { width } = useWindowDimensions();
  const tablet = width >= 640;

  return (
    <View style={[styles.wrap, { paddingHorizontal: tablet ? 24 : 16 }]}>
      <View
        style={[styles.card, cardShadow, onReplay ? styles.cardWithReplay : null]}
        accessible
        accessibilityRole="header"
        accessibilityLabel={spoken}
      >
        <View style={styles.tag}>
          <Text style={styles.tagText} maxFontSizeMultiplier={1.3}>
            {tag}
          </Text>
        </View>
        <Text
          style={styles.title}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          maxFontSizeMultiplier={1.3}
        >
          {title}
        </Text>
        {progress ? (
          <View style={styles.progress}>
            <View style={styles.pips}>
              {PIP_IDS.slice(0, progress.total).map((id, index) => (
                <View
                  key={id}
                  style={[styles.pip, pipStyle(index, progress.completed)]}
                />
              ))}
            </View>
            <Text style={styles.count}>
              {progress.completed} of {progress.total}
            </Text>
          </View>
        ) : null}
      </View>
      {onReplay ? (
        <View style={[styles.replayWrap, { right: (tablet ? 24 : 16) + 10 }]} pointerEvents="box-none">
          <Pressable
            onPress={onReplay}
            hitSlop={8}
            style={({ pressed }) => [styles.replay, pressed ? styles.replayPressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Hear the story again"
          >
            <SpeechIcon size={24} color={colors.white} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    maxWidth: 512,
    alignSelf: "center",
    paddingTop: 12 + TAG_H / 2,
  },
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
  tagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.white,
  },
  cardWithReplay: { paddingHorizontal: 64 },
  replayWrap: { position: "absolute", top: 12 + TAG_H / 2, bottom: 0, justifyContent: "center" },
  replay: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.atPurple,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  replayPressed: { transform: [{ scale: 0.92 }] },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 26,
    lineHeight: 30,
    color: colors.atTeal,
    textAlign: "center",
  },
  progress: { flexDirection: "row", alignItems: "center", gap: 10 },
  pips: { flexDirection: "row", alignItems: "center", gap: 4 },
  pip: { height: 10, borderRadius: 999, borderWidth: 1 },
  pipDone: { width: 20, backgroundColor: colors.jgSun, borderColor: "#c99a1c" },
  pipNow: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 4,
    borderColor: colors.jgTeal,
  },
  pipTodo: {
    width: 10,
    backgroundColor: colors.white,
    borderColor: colors.jgField,
  },
  count: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.atTeal,
    fontVariant: ["tabular-nums"],
  },
  note: {
    fontFamily: fonts.headingBold,
    fontSize: 17,
    color: colors.atTeal,
    textAlign: "center",
  },
});
