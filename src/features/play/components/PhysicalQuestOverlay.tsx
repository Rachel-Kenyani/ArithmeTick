import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  CoinsArt,
  FindItArt,
  FingersArt,
  RaceDayArt,
  WaterDayArt,
  HandspanArt,
  HideGuessArt,
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
  task?: QuestTask;
  childName: string;
  story?: string;
  levelNumber?: number;
  onConfirmed(): void;
}

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

const QUEST_TASKS: Record<
  Exclude<QuestTask, "groups">,
  { Art: typeof HandspanArt; caption: string; steps: readonly string[] }
> = {
  findIt: {
    Art: FindItArt,
    caption: "Find 6 objects",
    steps: [
      "Find six objects that are the same, like spoons or shoes.",
      "Line them up.",
      "Touch each one and count: one, two, three, four, five, six!",
      "Show a grown-up.",
    ],
  },
  hideGuess: {
    Art: HideGuessArt,
    caption: "How many are hiding?",
    steps: [
      "Put seven bottle tops on the table.",
      "Close your eyes. A grown-up hides some under a cup.",
      "Open your eyes. How many are hiding?",
      "Lift the cup and check with the grown-up!",
    ],
  },
  fingers: {
    Art: FingersArt,
    caption: "Count your fingers",
    steps: [
      "Show five fingers on one hand.",
      "Show four more on the other hand.",
      "Count them all. How many?",
      "Now swap! A grown-up shows fingers, and you say how many.",
    ],
  },
  waterDay: {
    Art: WaterDayArt,
    caption: "How many litres?",
    steps: [
      "Find an empty 1-litre bottle with a grown-up.",
      "Fill it with water. That is 1 litre.",
      "Pour it into a big basin or bucket. Count 1 litre.",
      "Fill and pour again. Count each litre: 2, 3, 4…",
      "Tell a grown-up how many litres fill the basin.",
    ],
  },
  raceDay: {
    Art: RaceDayArt,
    caption: "Who came first?",
    steps: [
      "Line up five toys at the start.",
      "Race them to the finish, one at a time.",
      "Say who came 1st, 2nd, 3rd, 4th and 5th.",
      "Ask a grown-up: which toy came 3rd?",
    ],
  },
  length: {
    Art: HandspanArt,
    caption: "How many hands long?",
    steps: [
      "Put your hand at one end of a table. That's 1.",
      "Lift it. Put it down just in front. That's 2.",
      "Keep going to the end.",
      "Tell a grown-up how many.",
    ],
  },
  massCapacity: {
    Art: ScaleCupArt,
    caption: "Heavy, light and full",
    steps: [
      "Hold two things: which is heavier?",
      "Fill a jug, one cup at a time",
      "Tell a grown-up how many cups",
    ],
  },
  money: {
    Art: CoinsArt,
    caption: "Pay with shillings",
    steps: [
      "Find some coins with a grown-up.",
      "Pick out the ten-shilling coins.",
      "Count three of them: ten, twenty, thirty.",
      "Play shop. Pay a grown-up thirty shillings.",
    ],
  },
  shapes: {
    Art: ShapesArt,
    caption: "Build a shape house",
    steps: [
      "Lay a book on the floor. It's a rectangle: the walls.",
      "Fold a paper from corner to corner. It's a triangle: the roof.",
      "Find a round lid. It's a circle: the sun.",
      "Lay a pencil under the house. It's a straight line: the ground.",
      "Bend a shoelace up to the door. It's a curved line: the path. Show a grown-up!",
    ],
  },
};

interface GrownUpSum {
  a: number;
  b: number;
  choices: number[];
}

const DOT = 56;
const groupWidth = (n: number) =>
  Math.min(n, 4) * DOT + (Math.min(n, 4) - 1) * 6 + 40;

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
  const stepTexts: readonly string[] =
    task === "groups" ? STEPS.map((s) => s.text) : QUEST_TASKS[task].steps;
  const stepsLine = stepTexts
    .map((t) => (/[.!?]$/.test(t) ? t : `${t}.`))
    .join(" ");
  const line = story ? `${story} ${stepsLine}` : stepsLine;
  const read = () =>
    narration.quest(story, stepsLine, grade, levelNumber, task);
  useEffect(() => {
    narration.quest(story, stepsLine, grade, levelNumber, task);
    return () => narration.stop();
  }, [story, stepsLine, grade, levelNumber, task]);
  const stepOffsets = stepTexts.map(
    (_, i) =>
      wordsOf(story).length +
      stepTexts.slice(0, i).reduce((n, t) => n + wordsOf(t).length, 0),
  );
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
    () =>
      Array.from({ length: first + second }, (_, i) => ({
        id: `cap-${i}`,
        inFirst: i < first,
      })),
    [first, second],
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.panel}
      showsVerticalScrollIndicator={false}
    >
      {story ? (
        <SpokenText text={story} source={line} style={styles.story} />
      ) : null}

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
                {dots
                  .filter((d) => d.inFirst)
                  .map((d) => (
                    <View key={d.id} style={styles.dot}>
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
                  .filter((d) => !d.inFirst)
                  .map((d) => (
                    <View key={d.id} style={styles.dot}>
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
                <SpokenText
                  text={s.text}
                  source={line}
                  offset={stepOffsets[i]}
                  style={styles.stepText}
                />
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

function TaskCard({
  task,
  line,
  offsets,
}: Readonly<{
  task: Exclude<QuestTask, "groups">;
  line: string;
  offsets: number[];
}>) {
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
            <SpokenText
              text={text}
              source={line}
              offset={offsets[i]}
              style={styles.stepText}
            />
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
