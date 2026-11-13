import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { sfx } from "@/services/audio";
import { narration } from "@/services/narration";
import type { ColumnsProps } from "@/types/domain";

import { COUNT_STEP_MS } from "../ten-frame/constants";
import { useScheduler } from "../ten-frame/hooks/useScheduler";
import ColumnSum, { FLY_MS } from "./ColumnSum";
import type { Place } from "./PlaceValueChart";
import CountingFrames, { framesLayout } from "./CountingFrames";
import CountingGroups, { groupsLayout } from "./CountingGroups";
import { Prompt, ReplayOrNext, TARGET, partStyles } from "./parts";
import { sameSize } from "./packTensLogic";
import { carriedInto, choicesFor, columnTerms, columnTotals, columnsClip, columnsPrompt, focusPlace, isCarriedInto, nextStep, writtenDigits, type ColumnsStep } from "./columnsLogic";

const DRAFT_VERSION = 2;
const SOLVED_HANDOFF_MS = 1600;
const CARRY_SHOW_MS = 900;

type CarryPhase = "none" | "show" | "flying" | "landed";

export default function Grade3Columns({ level = 0, a, b, item = "mango", waiting = false, onStruggle, onAttempt, onSolved, draft, onDraft }: Readonly<ColumnsProps>) {
  const schedule = useScheduler();
  const totals = columnTotals(a, b);
  const [step, setStep] = useState<ColumnsStep>("ones");
  const [misses, setMisses] = useState(draft?.version === DRAFT_VERSION ? draft.misses : 0);
  const [marks, setMarks] = useState<Partial<Record<number, number>>>({});
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [carryPhase, setCarryPhase] = useState<CarryPhase>("none");
  const doneRef = useRef(false);

  useEffect(() => {
    onDraft?.({ version: DRAFT_VERSION, misses });
  }, [onDraft, misses]);

  const place = focusPlace(step);
  const adding = step === "ones" || step === "tens" || step === "hundreds";
  const carryAsk = carryAskFor(step);

  const frameColumn = frameColumnFor(step);
  const terms = useMemo(() => (frameColumn ? columnTerms(frameColumn, a, b) : []), [frameColumn, a, b]);
  const frameTotal = terms.reduce((x, y) => x + y, 0);
  const shownMarks = useMemo(() => (carryAsk ? Object.fromEntries(Array.from({ length: frameTotal }, (_, i) => [i, i + 1])) : marks), [carryAsk, frameTotal, marks]);
  const layout = useMemo(() => {
    if (!size) return { cell: 30, stacked: false };
    return carryAsk ? framesLayout(size, frameTotal) : groupsLayout(size, terms);
  }, [size, carryAsk, frameTotal, terms]);
  const allCounted = Object.keys(marks).length >= frameTotal;
  const choices = useMemo(() => (place && adding ? choicesFor(totals[place]) : []), [place, adding, totals]);

  const playCarry = () => {
    setCarryPhase("show");
    schedule(() => {
      sfx.bundle();
      setCarryPhase("flying");
    }, CARRY_SHOW_MS);
    schedule(() => {
      sfx.snap(0);
      setCarryPhase("landed");
    }, CARRY_SHOW_MS + FLY_MS);
  };

  const replayCarry = () => {
    narration.prompt(columnsPrompt(step, a, b), columnsClip(step, 3, level));
    playCarry();
  };

  const finishCarry = () => {
    setCarryPhase("none");
    setStep(nextStep(step, a, b));
  };

  const advance = () => {
    setMarks({});
    const next = nextStep(step, a, b);
    setStep(next);
    if (next === "carryTens" || next === "carryHundreds") {
      playCarry();
      return;
    }
    if (next === "solved") {
      doneRef.current = true;
      schedule(() => sfx.solved(), 300);
      schedule(onSolved, SOLVED_HANDOFF_MS);
    }
  };

  const countOne = (index: number) => {
    if (waiting || !adding || marks[index] !== undefined) return;
    const n = Object.keys(marks).length + 1;
    sfx.snap(n - 1);
    narration.number(n);
    setMarks((prev) => ({ ...prev, [index]: n }));
  };

  const countAloud = () => {
    setMarks({});
    for (let i = 1; i <= frameTotal; i++) {
      schedule(() => {
        sfx.snap(i - 1);
        narration.number(i);
        setMarks((prev) => ({ ...prev, [i - 1]: i }));
      }, i * COUNT_STEP_MS);
    }
    return (frameTotal + 1) * COUNT_STEP_MS;
  };

  const pick = (n: number) => {
    if (doneRef.current || waiting || !place || !adding) return;
    const target = totals[place];
    const correct = n === target;
    onAttempt?.({ target, answer: n, correct });
    if (!correct) {
      setMisses((m) => m + 1);
      sfx.nudge();
      schedule(onStruggle, countAloud());
      return;
    }
    sfx.groupPulse();
    advance();
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (sameSize(prev, width, height) ? prev : { w: width, h: height }));
  };


  return (
    <View style={styles.root} testID={`g3-columns-l${level}-${a}-${b}`}>
      <ColumnSum op="add" a={a} b={b} {...carryView(step, carryPhase, a, b)} focus={place} solved={step === "solved"} />

      <Prompt text={columnsPrompt(step, a, b)} clipId={columnsClip(step, 3, level)} waiting={waiting} silent={step === "solved"} />

      {frameColumn && frameTotal > 0 ? (
        <View style={styles.trayRoom} onLayout={onLayout}>
          {size && carryAsk ? <CountingFrames key={`regroup-${frameColumn}`} terms={terms} carried={isCarriedInto(frameColumn, a, b)} marks={shownMarks} cell={layout.cell} stacked={layout.stacked} onTap={countOne} /> : null}
          {size && !carryAsk ? <CountingGroups key={`add-${frameColumn}`} terms={terms} carried={isCarriedInto(frameColumn, a, b)} marks={marks} cell={layout.cell} stacked={layout.stacked} onTap={countOne} /> : null}
        </View>
      ) : (
        <View style={styles.trayRoom} />
      )}

      <View style={styles.actions}>
        {carryAsk && carryPhase === "landed" ? <ReplayOrNext onReplay={replayCarry} onNext={finishCarry} /> : null}
        {adding && allCounted ? (
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

function frameColumnFor(step: ColumnsStep): Place | null {
  if (step === "carryTens") return "ones";
  if (step === "carryHundreds") return "tens";
  return focusPlace(step);
}

function carryView(step: ColumnsStep, phase: CarryPhase, a: number, b: number) {
  const answer = writtenDigits(step, a, b);
  const carried = carriedInto(step, a, b);
  const from = frameColumnFor(step);
  const carrying = step === "carryTens" || step === "carryHundreds";
  if (!carrying || !from || phase === "none" || phase === "landed") return { answer, carried, flight: null };
  const to: Place = from === "ones" ? "tens" : "hundreds";
  return {
    answer: { ...answer, [from]: columnTotals(a, b)[from] },
    carried: { ...carried, [to]: false },
    flight: phase === "flying" ? { key: `carry-${to}`, from, fromRow: "answer" as const, to, label: "1" } : null,
  };
}

function carryAskFor(step: ColumnsStep): "tens" | "hundreds" | null {
  if (step === "carryTens") return "tens";
  if (step === "carryHundreds") return "hundreds";
  return null;
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 10 },
  trayRoom: { flex: 1, alignSelf: "stretch", alignItems: "center", justifyContent: "center" },
  actions: { minHeight: TARGET, alignItems: "center", justifyContent: "center" },
});
