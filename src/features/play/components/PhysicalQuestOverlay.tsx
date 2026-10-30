/**
 * Move & Play (every 3rd level): the child makes 10 with real objects in two groups and shows a grown-up.
 * The task is drawn, not just written: 10 bottle tops split into two coloured groups ("7 and 3 make 10") and three
 * illustrated steps, addressed to the child by name. Grown-up instructions use the plum grown-up voice. Finishing needs a grown-up: a 2-second press-and-hold, then a quick sum a young child can't
 * guess (e.g. 6 × 7). A wrong pick quietly swaps in a new sum — no reward, no error message.
 */

import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  CapsStepArt,
  GroupsStepArt,
  GrownUpStepArt,
} from "@/components/illustrations/QuestStepArt";
import GrownUpNote, { GROWN_UP } from "@/components/ui/GrownUpNote";
import HoldToConfirm from "@/components/ui/HoldToConfirm";
import { CapFace } from "@/features/play/games/ten-frame/components/CapFace";
import { sfx } from "@/services/audio";
import type { Grade } from "@/types/domain";
import { colors, fonts } from "@/theme";
import Divider from "@/components/ui/Divider";

export interface PhysicalQuestOverlayProps {
  grade: Grade;
  /** The child's name, for the directions ("Amani, make 2 groups"). */
  childName: string;
  onConfirmed(): void;
}

/** The example split drawn on the card, per grade: [first group, second group]. */
const SPLITS: Record<Grade, readonly [number, number]> = {
  1: [7, 3],
  2: [8, 2],
  3: [5, 5],
};
const STEPS = [
  { Art: CapsStepArt, text: "Get 10 bottle tops" },
  { Art: GroupsStepArt, text: "Make 2 groups" },
  { Art: GrownUpStepArt, text: "Show a grown-up" },
] as const;

interface GrownUpSum {
  a: number;
  b: number;
  choices: number[];
}

const DOT = 56;
/** Up to 4 dots per row inside a group (dots + gaps + padding + border). */
const groupWidth = (n: number) =>
  Math.min(n, 4) * DOT + (Math.min(n, 4) - 1) * 6 + 40;

/** A times-table sum (6–9 × 6–9) with two near-miss choices, shuffled. */
function newSum(): GrownUpSum {
  const a = 6 + Math.floor(Math.random() * 4);
  const b = 6 + Math.floor(Math.random() * 4);
  const answer = a * b;
  const choices = [answer, answer + a, answer - b].sort(
    () => Math.random() - 0.5,
  );
  return { a, b, choices };
}

export default function PhysicalQuestOverlay({
  grade,
  childName,
  onConfirmed,
}: Readonly<PhysicalQuestOverlayProps>) {
  const [first, second] = SPLITS[grade];
  const [checking, setChecking] = useState(false);
  const [sum, setSum] = useState(newSum);
  const doneRef = useRef(false);

  const pick = (choice: number) => {
    if (doneRef.current) return;
    if (choice !== sum.a * sum.b) {
      sfx.nudge();
      setSum(newSum());
      return;
    }
    doneRef.current = true;
    onConfirmed();
  };

  const dots = useMemo(
    () => Array.from({ length: first + second }, (_, i) => i < first),
    [first, second],
  );

  return (
    // Scrolls on short phones so the grown-up check below the steps is always reachable.
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.panel}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={styles.picture}
        accessible
        accessibilityLabel={`${first} and ${second} make 10`}
      >
        <View style={styles.groups}>
          <View
            style={[
              styles.group,
              styles.groupA,
              { maxWidth: groupWidth(first) },
            ]}
          >
            {dots.filter(Boolean).map((_, i) => (
              <View key={`a${i}`} style={styles.dot}>
                <CapFace palette="teal" />
              </View>
            ))}
          </View>
          <View
            style={[
              styles.group,
              styles.groupB,
              { maxWidth: groupWidth(second) },
            ]}
          >
            {dots
              .filter((d) => !d)
              .map((_, i) => (
                <View key={`b${i}`} style={styles.dot}>
                  <CapFace palette="purple" />
                </View>
              ))}
          </View>
        </View>
        <Text style={styles.split}>
          <Text style={{ color: colors.atTeal }}>{first}</Text> and{" "}
          <Text style={{ color: colors.atPurple }}>{second}</Text> make 10
        </Text>
      </View>

      <Divider style={{ marginVertical: 4 }} />

      <View style={styles.steps}>
        {STEPS.map((s, i) => (
          <View key={s.text} style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <s.Art size={56} />
            <Text style={styles.stepText}>{s.text}</Text>
          </View>
        ))}
      </View>

      {checking ? (
        <GrownUpNote>
          <View style={styles.check} accessibilityLiveRegion="polite">
            <Text
              style={styles.checkTitle}
            >{`Grown-up check: what is ${sum.a} × ${sum.b}?`}</Text>
            <View style={styles.choices}>
              {sum.choices.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => pick(c)}
                  style={styles.choice}
                  accessibilityRole="button"
                  accessibilityLabel={String(c)}
                >
                  <Text style={styles.choiceText}>{c}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </GrownUpNote>
      ) : (
        <HoldToConfirm
          label="Grown-up: hold when done"
          onConfirm={() => setChecking(true)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Phone-width card, centred on tablets.
  scroll: { flex: 1, width: "100%", maxWidth: 440, alignSelf: "center" },
  panel: {
    gap: 14,
    padding: 16,
    paddingBottom: 28,
    backgroundColor: colors.jgCard,
    borderRadius: 24,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 26,
    color: colors.atTeal,
    textAlign: "center",
  },
  picture: { alignItems: "center", gap: 8 },
  groups: { flexDirection: "column", gap: 14, alignItems: "center" },
  group: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    padding: 8,
    borderRadius: 16,
    borderWidth: 3,
    justifyContent: "center",
  },
  groupA: { borderColor: colors.atTealLight },
  groupB: { borderColor: colors.atPurpleLight },
  dot: { width: DOT, height: DOT },
  split: { fontFamily: fonts.headingBold, fontSize: 28 },
  steps: { gap: 8 },
  step: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.atPurple,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.white,
  },
  stepText: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: colors.atInk,
    flexShrink: 1,
  },
  check: { gap: 10, alignItems: "center" },
  checkTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 18,
    color: GROWN_UP.ink,
    textAlign: "center",
  },
  choices: { flexDirection: "row", gap: 10 },
  choice: {
    minWidth: 72,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: GROWN_UP.border,
    alignItems: "center",
  },
  choiceText: { fontFamily: fonts.bodyBold, fontSize: 22, color: GROWN_UP.ink },
});
