import { useEffect, useRef, useState, type ComponentRef } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { FadeIn, ReduceMotion, ZoomIn } from "react-native-reanimated";

import { sfx } from "@/services/audio";
import { narration } from "@/services/narration";
import type { GroupsProps } from "@/types/domain";
import { colors, fonts } from "@/theme";

import { DragItem } from "../place-value/DragItem";
import { Loose, Prompt, TARGET, partStyles, type Bubble } from "../place-value/parts";
import { CountBubble } from "../ten-frame/components/CountBubble";
import { NumberTile } from "../ten-frame/components/NumberTile";
import { useScheduler } from "../ten-frame/hooks/useScheduler";

type Step = "plant" | "count" | "answer" | "solved";

const DRAFT_VERSION = 1;
const SOLVED_HANDOFF_MS = 1400;
const SKIP_STEP_MS = 1200;
const SOIL = "#8A5A33";
const SOIL_DEEP = "#5E3B1E";
const POP = ZoomIn.springify().stiffness(380).damping(20).reduceMotion(ReduceMotion.System);

const around = (n: number) => [n - 1, n, n + 1].filter((x) => x >= 0);

export default function Grade2Groups({ level, groups, each, item = "seed", waiting = false, onStruggle, onAttempt, onSolved, draft, onDraft }: Readonly<GroupsProps>) {
  const schedule = useScheduler();
  const answer = groups * each;
  const [inHole, setInHole] = useState<number[]>(() => Array.from({ length: groups }, () => 0));
  const [counted, setCounted] = useState(0);
  const [step, setStep] = useState<Step>("plant");
  const [misses, setMisses] = useState(draft?.version === DRAFT_VERSION ? draft.misses : 0);
  const [bubbles, setBubbles] = useState<Partial<Record<number, Bubble>>>({});
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const holeRefs = useRef<(ComponentRef<typeof View> | null)[]>([]);
  const bubbleN = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    onDraft?.({ version: DRAFT_VERSION, misses });
  }, [onDraft, misses]);

  const planted = inHole.reduce((s, n) => s + n, 0);
  const pile = answer - planted;

  const plantIn = (hole: number) => {
    if (step !== "plant" || waiting || inHole[hole] >= each) {
      if (step === "plant") sfx.nudge();
      return;
    }
    sfx.snap(inHole[hole]);
    const next = inHole.map((n, i) => (i === hole ? n + 1 : n));
    setInHole(next);
    if (next.every((n) => n === each)) {
      sfx.groupPulse();
      schedule(() => setStep("count"), 600);
    }
  };

  const plantNext = () => {
    const hole = inHole.findIndex((n) => n < each);
    if (hole >= 0) plantIn(hole);
  };

  const dropAt = (x: number, y: number) => {
    holeRefs.current.forEach((ref, hole) => {
      ref?.measureInWindow((fx, fy, fw, fh) => {
        const give = 16;
        if (x >= fx - give && x <= fx + fw + give && y >= fy - give && y <= fy + fh + give) plantIn(hole);
      });
    });
  };

  const show = (hole: number, label: number, delayMs: number) => {
    bubbleN.current += 1;
    const n = bubbleN.current;
    setBubbles((prev) => ({ ...prev, [hole]: { label, delayMs, n } }));
  };

  const countHole = (hole: number) => {
    if (step !== "count" || waiting || hole !== counted) return;
    const total = (hole + 1) * each;
    show(hole, total, 0);
    narration.number(total);
    sfx.snap(hole);
    setCounted(hole + 1);
    if (hole + 1 === groups) schedule(() => setStep("answer"), 900);
  };

  const skipCountAloud = () => {
    Array.from({ length: groups }, (_, hole) => {
      show(hole, (hole + 1) * each, hole * SKIP_STEP_MS);
      schedule(() => narration.number((hole + 1) * each), hole * SKIP_STEP_MS);
      return hole;
    });
    return groups * SKIP_STEP_MS;
  };

  const pick = (n: number) => {
    if (step !== "answer" || doneRef.current) return;
    const correct = n === answer;
    onAttempt?.({ target: answer, answer: n, correct });
    if (!correct) {
      setMisses((m) => m + 1);
      sfx.nudge();
      schedule(onStruggle, skipCountAloud());
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
  const seed = size ? Math.floor(Math.max(TARGET - 4, Math.min(60, (size.w - 80) / (groups * 2.8)))) : TARGET;
  const holeW = seed * each + 10 * (each - 1) + 36;
  const id = `g2-l${String(level ?? 0).padStart(2, "0")}`;
  const many = item === "cap" ? "bottle tops" : `${item}s`;

  const prompt = {
    plant: `Put ${each} ${many} in each hole.`,
    count: `Count in ${each === 2 ? "twos" : String(each) + "s"}. Tap each hole.`,
    answer: `How many ${many} does Brijo need?`,
    solved: `${groups} groups of ${each} make ${answer}!`,
  }[step];
  const clip = { plant: `${id}-plant`, count: `${id}-twos`, answer: `${id}-need`, solved: "" }[step];

  return (
    <View style={styles.root} onLayout={onLayout} testID={`g2-groups-l${level ?? 0}-${groups}x${each}`}>
      {size ? (
        <>
          <View style={[styles.strip, step === "solved" ? styles.stripWin : null]} accessible accessibilityLabel={`${Array.from({ length: groups }, () => each).join(" plus ")} equals ${step === "solved" ? answer : "what"}`}>
            {Array.from({ length: groups }, (_, i) => (
              <View key={`t-${i}`} style={styles.stripPart}>
                {i > 0 ? <Text style={styles.op}>+</Text> : null}
                <NumberTile value={inHole[i] === each ? each : "?"} tone={inHole[i] === each ? "five" : "ask"} size={42} fontSize={22} />
              </View>
            ))}
            <Text style={styles.op}>=</Text>
            <NumberTile value={step === "solved" ? answer : "?"} tone={step === "solved" ? "win" : "ask"} size={42} fontSize={22} />
          </View>
          <Prompt text={prompt} clipId={clip} waiting={waiting} silent={step === "solved"} />

          <View style={styles.holes}>
            {inHole.map((n, hole) => {
              const tappable = step === "count" && hole === counted;
              return (
                <Pressable
                  key={`hole-${hole}`}
                  ref={(r) => {
                    holeRefs.current[hole] = r;
                  }}
                  collapsable={false}
                  onPress={() => countHole(hole)}
                  disabled={!tappable}
                  accessibilityRole={tappable ? "button" : "image"}
                  accessibilityLabel={`Hole ${hole + 1}, ${n} ${n === 1 ? item : many}`}
                  style={[styles.hole, { width: holeW, minHeight: seed + 30 }, tappable ? styles.holeTap : null, n === each && step === "plant" ? styles.holeFull : null]}
                >
                  <View style={[styles.seeds, { minHeight: seed }]}>
                    {Array.from({ length: n }, (_, s) => (
                      <Animated.View key={`s-${hole}-${s}`} entering={POP}>
                        <Loose item={item} size={seed} />
                      </Animated.View>
                    ))}
                  </View>
                  {bubbles[hole] ? <CountBubble key={bubbles[hole].n} label={bubbles[hole].label} delayMs={bubbles[hole].delayMs} size={holeW} /> : null}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.pile}>
            {Array.from({ length: pile }, (_, i) => (
              <DragItem
                key={`p-${planted + i}`}
                enabled={step === "plant" && !waiting}
                onTap={plantNext}
                onDrop={dropAt}
                hitSlop={Math.max(0, Math.ceil((TARGET - seed) / 2))}
                label={`${item === "cap" ? "Bottle top" : item}. Tap or drag it into a hole`}
              >
                <Loose item={item} size={seed} fresh />
              </DragItem>
            ))}
          </View>

          <View style={styles.actions}>
            {step === "answer" ? (
              <Animated.View entering={FadeIn.duration(220)} style={partStyles.choices}>
                {around(answer).map((n) => (
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
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.atMintDeep,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  stripWin: { borderColor: "#E0A800", backgroundColor: colors.atCream },
  stripPart: { flexDirection: "row", alignItems: "center", gap: 6 },
  op: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.atInk },
  holes: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 14, marginTop: 24, marginBottom: 12 },
  hole: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: SOIL,
    borderWidth: 4,
    borderColor: SOIL_DEEP,
    paddingVertical: 12,
  },
  holeTap: { borderColor: colors.atYellow, borderStyle: "dashed" },
  holeFull: { borderColor: colors.atTealLight },
  seeds: { flexDirection: "row", alignItems: "center", gap: 10 },
  pile: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 14, minHeight: TARGET, marginTop: 8 },
  actions: { minHeight: TARGET, alignItems: "center", justifyContent: "center" },
});
