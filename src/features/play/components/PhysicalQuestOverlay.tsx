/**
 * Move & Play (every 3rd level): a task with real things, shown to a grown-up. Grade 1 makes 10 with real
 * objects in two groups; Grade 2 measures, pays and finds shapes at home (`task`, see QUEST_TASKS).
 * The task is drawn, not just written: 10 bottle tops split into two coloured groups ("7 and 3 make 10") and three
 * illustrated steps, addressed to the child by name. Grown-up instructions use the plum grown-up voice. Finishing needs a grown-up: a 2-second press-and-hold, then a quick sum a young child can't
 * guess (e.g. 6 × 7). A wrong pick quietly swaps in a new sum — no reward, no error message.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  CoinsArt,
  HandspanArt,
  ScaleCupArt,
  ShapesArt,
} from "@/components/illustrations/QuestTaskArt";
import {
  CapsStepArt,
  GroupsStepArt,
  GrownUpStepArt,
} from "@/components/illustrations/QuestStepArt";
import Button from "@/components/ui/Button";
import GrownUpNote, { GROWN_UP } from "@/components/ui/GrownUpNote";
import SpokenText from "@/components/ui/SpokenText";
import { SpeakerIcon } from "@/components/ui/icons";
import HoldToConfirm from "@/components/ui/HoldToConfirm";
import { CapFace } from "@/features/play/games/ten-frame/components/CapFace";
import { sfx } from "@/services/audio";
import { narration, wordsOf } from "@/services/narration";
import type { Grade, QuestTask } from "@/types/domain";
import { colors, fonts } from "@/theme";
import Divider from "@/components/ui/Divider";

export interface PhysicalQuestOverlayProps {
  grade: Grade;
  /** What to do with real things; default "groups" (make 10 in two groups). */
  task?: QuestTask;
  /** The child's name, for the directions ("Amani, make 2 groups"). */
  childName: string;
  /** Brijo's story line for this stop ("Time to move! …"), read aloud before the steps. */
  story?: string;
  /** For the recorded story line's file name. */
  levelNumber?: number;
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

/** Grade 2 measurement and geometry tasks: one picture, one caption, three short steps. */
const QUEST_TASKS: Record<Exclude<QuestTask, "groups">, { Art: typeof HandspanArt; caption: string; steps: readonly string[] }> = {
  length: {
    Art: HandspanArt,
    caption: "How many hands long?",
    steps: ["Put your hand at one end of a table. That's 1.", "Lift it. Put it down just in front. That's 2.", "Keep going to the end.", "Tell a grown-up how many."],
  },
  massCapacity: {
    Art: ScaleCupArt,
    caption: "Heavy, light and full",
    steps: ["Hold two things: which is heavier?", "Fill a jug, one cup at a time", "Tell a grown-up how many cups"],
  },
  money: {
    Art: CoinsArt,
    caption: "Pay with shillings",
    steps: ["Find some coins with a grown-up", "Count out 30 shillings", "Buy something together"],
  },
  shapes: {
    Art: ShapesArt,
    caption: "Find shapes and lines",
    steps: ["Find a circle, a triangle and a square", "Find a straight line and a curved line", "Show a grown-up"],
  },
};

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
  task = "groups",
  childName,
  story = "",
  levelNumber = 0,
  onConfirmed,
}: Readonly<PhysicalQuestOverlayProps>) {
  const [first, second] = SPLITS[grade];
  // Brijo reads the story line and then the steps as one line, so each step lights up as she reaches it.
  const stepTexts: readonly string[] = task === "groups" ? STEPS.map((s) => s.text) : QUEST_TASKS[task].steps;
  const stepsLine = stepTexts.map((t) => (/[.!?]$/.test(t) ? t : `${t}.`)).join(" ");
  const line = story ? `${story} ${stepsLine}` : stepsLine;
  const read = () => narration.quest(story, stepsLine, grade, levelNumber, task);
  useEffect(() => {
    narration.quest(story, stepsLine, grade, levelNumber, task);
    return () => narration.stop();
  }, [story, stepsLine, grade, levelNumber, task]);
  /** Where each step's words start in `line`. */
  const stepOffsets = stepTexts.map((_, i) => wordsOf(story).length + stepTexts.slice(0, i).reduce((n, t) => n + wordsOf(t).length, 0));
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
      {story ? <SpokenText text={story} source={line} style={styles.story} /> : null}

      {task === "groups" ? (
        <>
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
                <SpokenText text={s.text} source={line} offset={stepOffsets[i]} style={styles.stepText} />
              </View>
            ))}
          </View>
        </>
      ) : (
        <TaskCard task={task} line={line} offsets={stepOffsets} />
      )}

      <Button
        variant="purple"
        size="md"
        icon={<SpeakerIcon size={22} color={colors.white} />}
        onPress={read}
        accessibilityLabel="Repeat. Hear Brijo again"
      >
        Repeat
      </Button>

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

function TaskCard({ task, line, offsets }: Readonly<{ task: Exclude<QuestTask, "groups">; line: string; offsets: number[] }>) {
  const { Art, caption, steps } = QUEST_TASKS[task];
  return (
    <>
      <View style={styles.picture} accessible accessibilityLabel={caption}>
        <Art size={120} />
        <Text style={styles.split}>{caption}</Text>
      </View>

      <Divider style={{ marginVertical: 4 }} />

      <View style={styles.steps}>
        {steps.map((text, i) => (
          <View key={text} style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            {i === steps.length - 1 ? <GrownUpStepArt size={56} /> : null}
            <SpokenText text={text} source={line} offset={offsets[i]} style={styles.stepText} />
          </View>
        ))}
      </View>
    </>
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
  story: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: colors.atTeal,
    textAlign: "center",
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
