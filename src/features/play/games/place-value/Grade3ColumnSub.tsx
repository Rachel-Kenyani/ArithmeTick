import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { sfx } from "@/services/audio";
import { narration } from "@/services/narration";
import type { ColumnsProps } from "@/types/domain";
import { colors } from "@/theme";

import { COUNT_STEP_MS } from "../ten-frame/constants";
import { useScheduler } from "../ten-frame/hooks/useScheduler";
import ColumnSum, { FLY_MS, type Flight } from "./ColumnSum";
import { CountCap } from "./CountingFrames";
import { groupsLayout } from "./CountingGroups";
import type { Place } from "./PlaceValueChart";
import { Prompt, ReplayOrNext, TARGET, partStyles } from "./parts";
import { choicesFor, digitsOf } from "./columnsLogic";
import { sameSize } from "./packTensLogic";
import { columnTakeAway, firstSubStep, needsBorrow, nextSubStep, rewrittenTop, subClip, subFocus, subPrompt, subWritten, type SubStep } from "./subColumnsLogic";

const DRAFT_VERSION = 1;
const SOLVED_HANDOFF_MS = 1600;
/** When the lending digit is crossed out, and when its 1 starts to travel. */
const CROSS_MS = 700;
const LEND_MS = 1200;

type BorrowPhase = "start" | "crossed" | "flying" | "landed";
const PER_ROW = 5;

/**
 * Column subtraction the way it is done on paper. Brijo borrows when a column's top digit is too small, crossing
 * it out and writing the new digits. In each column the child taps bottle tops to take them away, then says how
 * many are left; a wrong answer has Brijo count what's left aloud.
 */
export default function Grade3ColumnSub({ level = 0, a, b, waiting = false, onStruggle, onAttempt, onSolved, draft, onDraft }: Readonly<ColumnsProps>) {
  const schedule = useScheduler();
  const [step, setStep] = useState<SubStep>(() => firstSubStep(a, b));
  const [misses, setMisses] = useState(draft?.version === DRAFT_VERSION ? draft.misses : 0);
  const [taken, setTaken] = useState<number[]>([]);
  const [marks, setMarks] = useState<Partial<Record<number, number>>>({});
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [borrowPhase, setBorrowPhase] = useState<BorrowPhase>("start");
  const [replays, setReplays] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    onDraft?.({ version: DRAFT_VERSION, misses });
  }, [onDraft, misses]);

  const borrowing = step === "borrowTens" || step === "borrowHundreds";

  /**
   * Brijo borrows on his own, step by step, then waits for the child to tap Next (or Show me again). Waits while the
   * story card is up. `replays` restarts it.
   */
  useEffect(() => {
    if (!borrowing || waiting) return;
    const timers = [
      setTimeout(() => {
        sfx.nudge();
        setBorrowPhase("crossed");
      }, CROSS_MS),
      setTimeout(() => {
        sfx.bundle();
        setBorrowPhase("flying");
      }, LEND_MS),
      setTimeout(() => {
        sfx.snap(0);
        setBorrowPhase("landed");
      }, LEND_MS + FLY_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, [borrowing, waiting, replays]);

  const replayBorrow = () => {
    setBorrowPhase("start");
    setReplays((n) => n + 1);
    narration.prompt(subPrompt(step, a, b), subClip(step, 3, level));
  };

  const finishBorrow = () => {
    setBorrowPhase("start");
    setStep(nextSubStep(step, a, b));
  };

  const place = subFocus(step);
  const { from, take } = place ? columnTakeAway(place, a, b) : { from: 0, take: 0 };
  const original = place ? digitsOf(a)[place] : 0;
  const borrowedIn = place === "ones" ? needsBorrow("ones", a, b) : place === "tens" && needsBorrow("tens", a, b);
  const left = from - take;
  const allTaken = taken.length >= take;
  const answering = !borrowing && step !== "solved" && allTaken;
  const choices = useMemo(() => choicesFor(left), [left]);
  const layout = size && from > 0 ? groupsLayout(size, [from]) : { cell: 30, stacked: true };

  const takeAway = (index: number) => {
    if (waiting || borrowing || allTaken || taken.includes(index)) return;
    sfx.snap(taken.length);
    narration.number(taken.length + 1);
    setTaken((prev) => [...prev, index]);
  };

  /** Brijo counts the bottle tops still there, numbering each one. Returns how long that takes. */
  const countLeft = () => {
    const rest = Array.from({ length: from }, (_, i) => i).filter((i) => !taken.includes(i));
    setMarks({});
    rest.forEach((index, k) => {
      schedule(() => {
        sfx.snap(k);
        narration.number(k + 1);
        setMarks((prev) => ({ ...prev, [index]: k + 1 }));
      }, (k + 1) * COUNT_STEP_MS);
    });
    return (rest.length + 1) * COUNT_STEP_MS;
  };

  const pick = (n: number) => {
    if (doneRef.current || waiting || !answering) return;
    const correct = n === left;
    onAttempt?.({ target: left, answer: n, correct });
    if (!correct) {
      setMisses((m) => m + 1);
      sfx.nudge();
      schedule(onStruggle, countLeft());
      return;
    }
    sfx.groupPulse();
    setTaken([]);
    setMarks({});
    const next = nextSubStep(step, a, b);
    setStep(next);
    if (next === "solved") {
      doneRef.current = true;
      schedule(() => sfx.solved(), 300);
      schedule(onSolved, SOLVED_HANDOFF_MS);
    }
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (sameSize(prev, width, height) ? prev : { w: width, h: height }));
  };

  const caps = Array.from({ length: from }, (_, i) => i);
  const gap = Math.max(2, Math.round(layout.cell * 0.12));
  const across = Math.min(from, PER_ROW);

  return (
    <View style={styles.root} testID={`g3-columnsub-l${level}-${a}-${b}`}>
      <ColumnSum op="sub" a={a} b={b} carried={{}} {...borrowView(step, borrowPhase, a, b)} answer={subWritten(step, a, b)} focus={place} solved={step === "solved"} />

      <Prompt text={subPrompt(step, a, b)} clipId={subClip(step, 3, level)} waiting={waiting} silent={step === "solved"} />

      <View style={styles.trayRoom} onLayout={onLayout}>
        {size && place && from > 0 ? (
          <View key={step} style={styles.group} accessibilityLabel={`${from} bottle tops. Take away ${take}. Taken ${taken.length}`}>
            <View style={[styles.caps, { gap, width: across * layout.cell + (across - 1) * gap }]}>
              {caps.map((i) => (
                <CountCap key={`${place}-cap-${i}`} mark={marks[i]} taken={taken.includes(i)} palette={borrowedIn && i >= original ? "gold" : "teal"} cell={layout.cell} onTap={() => takeAway(i)} />
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        {borrowing && borrowPhase === "landed" ? <ReplayOrNext onReplay={replayBorrow} onNext={finishBorrow} /> : null}
        {answering ? (
          <Animated.View key={step} entering={FadeIn.duration(220)} style={partStyles.choices}>
            {choices.map((n) => (
              <Pressable key={n} onPress={() => pick(n)} accessibilityRole="button" accessibilityLabel={String(n)} style={partStyles.choice}>
                <Text style={partStyles.choiceText}>{n}</Text>
              </Pressable>
            ))}
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

/**
 * What the written sum shows while borrowing: first the lending digit is crossed out and one less is written above
 * it, then a 1 travels from it to the column on its right, which becomes ten more (2 becomes 12).
 */
function borrowView(step: SubStep, phase: BorrowPhase, a: number, b: number): { rewritten: Partial<Record<Place, number>>; flight: Flight | null } {
  const full = rewrittenTop(step, a, b);
  if (step !== "borrowTens" && step !== "borrowHundreds") return { rewritten: full, flight: null };
  const lender: Place = step === "borrowTens" ? "tens" : "hundreds";
  const receiver: Place = step === "borrowTens" ? "ones" : "tens";
  const before = step === "borrowTens" ? {} : rewrittenTop("ones", a, b);
  if (phase === "start") return { rewritten: before, flight: null };
  if (phase === "landed") return { rewritten: full, flight: null };
  return {
    rewritten: { ...before, [lender]: full[lender] },
    flight: phase === "flying" ? { key: `borrow-${receiver}`, from: lender, fromRow: "carry", to: receiver, label: "1" } : null,
  };
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 10 },
  trayRoom: { flex: 1, alignSelf: "stretch", alignItems: "center", justifyContent: "center" },
  group: { padding: 8, borderRadius: 14, backgroundColor: colors.atCream, borderWidth: 2, borderColor: colors.atMintDeep },
  caps: { flexDirection: "row", flexWrap: "wrap" },
  actions: { minHeight: TARGET, alignItems: "center", justifyContent: "center" },
});
