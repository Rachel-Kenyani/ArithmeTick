import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";

import Scaled from "@/components/ui/Scaled";
import { PlayIcon } from "@/components/ui/icons";
import type { NextStep } from "@/data/nextStep";
import { useUiScale } from "@/hooks/useUiScale";
import { sfx } from "@/services/audio";
import { colors, fonts } from "@/theme";

const ENTER = FadeInDown.springify().stiffness(260).damping(24).reduceMotion(ReduceMotion.System);

/**
 * Under the map's banner after a hard level: a friendly nudge to warm up on an earlier level first. Never says the
 * child got things wrong. Shown only for a warm-up; the map already marks the next level and a level to try again.
 */
export default function NextUpChip({ step, onPlay }: Readonly<{ step: NextStep; onPlay: (level: number) => void }>) {
  const scale = useUiScale();
  if (step.kind !== "warmUp") return null;
  return (
    <Animated.View entering={ENTER}>
      <Scaled style={[styles.outer, { maxWidth: 512 * scale }]}>
        <Pressable
          onPress={() => {
            sfx.click();
            onPlay(step.level);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Next up: a quick warm-up on level ${step.level}, then level ${step.then}`}
          style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
        >
          <View style={styles.tag}>
            <Text style={styles.tagText}>NEXT UP</Text>
          </View>
          <Text style={styles.text} numberOfLines={1}>
            Warm up on Level {step.level} first
          </Text>
          <View style={styles.play}>
            <PlayIcon size={16} strokeWidth={2.6} color={colors.atInk} />
          </View>
        </Pressable>
      </Scaled>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: { width: "100%", alignSelf: "center", paddingHorizontal: 16, paddingTop: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "center",
    paddingLeft: 8,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.atTeal,
    borderBottomWidth: 4,
    borderBottomColor: colors.jgTealEdge,
  },
  pressed: { transform: [{ translateY: 2 }], borderBottomWidth: 2 },
  tag: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: colors.atYellowSoft },
  tagText: { fontFamily: fonts.textBold, fontSize: 11, letterSpacing: 1, color: colors.atInk },
  text: { flexShrink: 1, fontFamily: fonts.textBold, fontSize: 15, color: colors.white },
  play: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.atYellowSoft },
});
