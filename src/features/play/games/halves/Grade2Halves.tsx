import { useEffect, useRef, useState, type ComponentRef } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { FadeIn, ReduceMotion, ZoomIn } from "react-native-reanimated";

import MonkeyArt from "@/components/illustrations/MonkeyArt";
import { sfx } from "@/services/audio";
import type { HalvesProps } from "@/types/domain";
import { colors, fonts } from "@/theme";

import { DragItem } from "../place-value/DragItem";
import { Loose, Prompt, TARGET, partStyles, type Bubble } from "../place-value/parts";
import { NumberTile } from "../ten-frame/components/NumberTile";
import { COUNT_STEP_MS } from "../ten-frame/constants";
import { useScheduler } from "../ten-frame/hooks/useScheduler";

type Step = "share" | "answer" | "solved";

const DRAFT_VERSION = 1;
const SOLVED_HANDOFF_MS = 1400;
const MONKEYS = [
  { id: "monkey-1", tone: "#8a5a33" },
  { id: "monkey-2", tone: "#6b4a2e" },
] as const;
const SHARES = MONKEYS.length;
const POP = ZoomIn.springify().stiffness(380).damping(20).reduceMotion(ReduceMotion.System);

const around = (n: number) => [n - 1, n, n + 1].filter((x) => x >= 0);

function plural(item: string): string {
  if (item === "cap") return "bottle tops";
  return item === "tomato" || item === "mango" ? `${item}es` : `${item}s`;
}

export default function Grade2Halves({ level, total, item = "tomato", waiting = false, onStruggle, onAttempt, onSolved, draft, onDraft }: Readonly<HalvesProps>) {
  const schedule = useScheduler();
  const half = total / SHARES;
  const [onPlate, setOnPlate] = useState<number[]>(() => Array.from({ length: SHARES }, () => 0));
  const [step, setStep] = useState<Step>("share");
  const [misses, setMisses] = useState(draft?.version === DRAFT_VERSION ? draft.misses : 0);
  const [bubbles, setBubbles] = useState<Partial<Record<string, Bubble>>>({});
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const plateRefs = useRef<(ComponentRef<typeof View> | null)[]>([]);
  const bubbleN = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    onDraft?.({ version: DRAFT_VERSION, misses });
  }, [onDraft, misses]);

  const shared = onPlate.reduce((s, n) => s + n, 0);
  const pile = total - shared;

  const giveTo = (plate: number) => {
    if (step !== "share" || waiting) return;
    if (onPlate[plate] >= half) {
      sfx.nudge();
      return;
    }
    sfx.snap(onPlate[plate]);
    const next = onPlate.map((n, i) => (i === plate ? n + 1 : n));
    setOnPlate(next);
    if (next.every((n) => n === half)) {
      sfx.groupPulse();
      schedule(() => setStep("answer"), 600);
    }
  };

  const giveNext = () => {
    const fewest = onPlate.indexOf(Math.min(...onPlate));
    giveTo(fewest);
  };

  const dropAt = (x: number, y: number) => {
    plateRefs.current.forEach((ref, plate) => {
      ref?.measureInWindow((fx, fy, fw, fh) => {
        const give = 16;
        if (x >= fx - give && x <= fx + fw + give && y >= fy - give && y <= fy + fh + give) giveTo(plate);
      });
    });
  };

  const countPlateAloud = () => {
    setBubbles((prev) => {
      const next = { ...prev };
      Array.from({ length: half }, (_, i) => {
        bubbleN.current += 1;
        next[`0-${i}`] = { label: i + 1, delayMs: i * COUNT_STEP_MS, n: bubbleN.current };
        return i;
      });
      return next;
    });
    Array.from({ length: half }, (_, i) => schedule(() => sfx.snap(i), i * COUNT_STEP_MS));
    return half * COUNT_STEP_MS;
  };

  const pick = (n: number) => {
    if (step !== "answer" || doneRef.current) return;
    const correct = n === half;
    onAttempt?.({ target: half, answer: n, correct });
    if (!correct) {
      setMisses((m) => m + 1);
      sfx.nudge();
      schedule(onStruggle, countPlateAloud());
      return;
    }
    doneRef.current = true;
    setStep("solved");
    schedule(() => sfx.solved(), 300);
    schedule(onSolved, SOLVED_HANDOFF_MS);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev && Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1 ? prev : { w: width, h: height }));
  };
  const cell = size ? Math.floor(Math.max(TARGET - 4, Math.min(56, (size.w - 120) / 5))) : TARGET;
  const perRow = Math.min(half, 2);
  const plateW = perRow * cell + (perRow - 1) * 10 + 32;
  const many = plural(item);
  const id = `g2-l${String(level ?? 0).padStart(2, "0")}`;

  const prompt = {
    share: `Give the ${many} out one at a time. Tap or drag a ${item === "cap" ? "bottle top" : item}.`,
    answer: "How many does each monkey get?",
    solved: `Half of ${total} is ${half}!`,
  }[step];
  const clip = { share: `${id}-share`, answer: `${id}-each`, solved: "" }[step];

  return (
    <View style={styles.root} onLayout={onLayout} testID={`g2-halves-l${level ?? 0}-${total}`}>
      {size ? (
        <>
          <View style={[styles.strip, step === "solved" ? styles.stripWin : null]} accessible accessibilityLabel={`Half of ${total} is ${step === "solved" ? half : "what"}`}>
            <Text style={styles.word}>Half of</Text>
            <NumberTile value={total} tone="total" size={42} fontSize={22} />
            <Text style={styles.word}>is</Text>
            <NumberTile value={step === "solved" ? half : "?"} tone={step === "solved" ? "win" : "ask"} size={42} fontSize={22} />
          </View>
          <Prompt text={prompt} clipId={clip} waiting={waiting} silent={step === "solved"} />

          <View style={styles.monkeys}>
            {MONKEYS.map((monkey, plate) => (
              <View key={monkey.id} style={styles.monkey}>
                <MonkeyArt size={64} tone={monkey.tone} title={`Monkey ${plate + 1}`} />
                <View
                  ref={(r) => {
                    plateRefs.current[plate] = r;
                  }}
                  collapsable={false}
                  accessible
                  accessibilityLabel={`Monkey ${plate + 1} has ${onPlate[plate]}`}
                  style={[styles.plate, { width: plateW, minHeight: Math.ceil(half / perRow) * (cell + 10) + 22 }, onPlate[plate] === half ? styles.plateFull : null]}
                >
                  {Array.from({ length: onPlate[plate] }, (_, i) => (
                    <Animated.View key={`p-${plate}-${i}`} entering={POP}>
                      <Loose item={item} size={cell} bubble={bubbles[`${plate}-${i}`]} />
                    </Animated.View>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <View style={styles.pile}>
            {Array.from({ length: pile }, (_, i) => (
              <DragItem
                key={`pile-${shared + i}`}
                enabled={step === "share" && !waiting}
                onTap={giveNext}
                onDrop={dropAt}
                hitSlop={Math.max(0, Math.ceil((TARGET - cell) / 2))}
                label={`${item === "cap" ? "Bottle top" : item}. Tap or drag it to a monkey`}
              >
                <Loose item={item} size={cell} fresh />
              </DragItem>
            ))}
          </View>

          <View style={styles.actions}>
            {step === "answer" ? (
              <Animated.View entering={FadeIn.duration(220)} style={partStyles.choices}>
                {around(half).map((n) => (
                  <Pressable key={n} onPress={() => pick(n)} accessibilityRole="button" accessibilityLabel={String(n)} style={partStyles.choice}>
                    <Text style={partStyles.choiceText}>{n}</Text>
                  </Pressable>
                ))}
              </Animated.View>
            ) : null}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 12 },
  strip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.atMintDeep,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  stripWin: { borderColor: "#E0A800", backgroundColor: colors.atCream },
  word: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.atInk },
  monkeys: { flexDirection: "row", justifyContent: "center", gap: 20, marginTop: 8 },
  monkey: { alignItems: "center", gap: 6 },
  plate: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    justifyContent: "center",
    gap: 10,
    padding: 10,
    borderRadius: 24,
    backgroundColor: colors.atCream,
    borderWidth: 3,
    borderColor: colors.atMintDeep,
  },
  plateFull: { borderColor: colors.atTealLight },
  pile: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 14, minHeight: TARGET, marginTop: 12 },
  actions: { minHeight: TARGET, alignItems: "center", justifyContent: "center" },
});
