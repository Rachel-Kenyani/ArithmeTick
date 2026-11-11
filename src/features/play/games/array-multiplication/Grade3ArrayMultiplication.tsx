import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { FadeIn, ReduceMotion, useReducedMotion } from "react-native-reanimated";

import { sfx } from "@/services/audio";
import { narration } from "@/services/narration";
import type { ArrayProps, LevelDraft } from "@/types/domain";
import { colors, fonts } from "@/theme";

import { partStyles } from "../place-value/parts";
import { DoneButton } from "../ten-frame/components/DoneButton";
import { NumberTile } from "../ten-frame/components/NumberTile";
import { useScheduler } from "../ten-frame/hooks/useScheduler";
import { ArrayBuilder, SKIP_W } from "./ArrayBuilder";
import { CountBeds } from "./CountBeds";
import {
  LIMITS,
  MAX_COLS,
  MAX_ROWS,
  SHOW_AFTER_MISSES,
  answerChoices,
  askLine,
  constrain,
  countLine,
  missKind,
  missLine,
  normalizePuzzle,
  recountLine,
  showLine,
  type Dims,
  type Puzzle,
} from "./logic";

/** Build the array (Brijo builds and counts it after two misses), count it row by row, then say how many. */
type Phase = "build" | "show" | "locked" | "count" | "answer" | "solved";

const LOCK_HOLD_MS = 1000;
const ASK_DELAY_MS = 700;
const SHOW_START_MS = 2600;
const SHOW_ROW_MS = 1100;
const SOLVED_AT_MS = 1600;
const GOAL_H = 68;
const EQ_H = 64;
const FOOT_H = 72;
const FADE = FadeIn.duration(260).reduceMotion(ReduceMotion.System);

export default function Grade3ArrayMultiplication({ level, item = "cap", rows: targetRows, cols: targetCols, palActive, waiting = false, onStruggle, onAttempt, onSolved, draft, onDraft }: Readonly<ArrayProps>) {
  const pz = useMemo(() => normalizePuzzle(targetRows, targetCols), [targetRows, targetCols]);
  const reduced = useReducedMotion();
  const schedule = useScheduler();
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [resumed] = useState(() => resumeArray(draft, pz.rows));
  const [phase, setPhase] = useState<Phase>(resumed.counting ? "count" : "build");
  const [childDims, setChildDims] = useState<Dims>(resumed.dims);
  const [grabbed, setGrabbed] = useState(resumed.dims.rows * resumed.dims.cols > 1);
  const [counted, setCounted] = useState<number[]>(resumed.counted);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shownRows, setShownRows] = useState(0);
  const missesRef = useRef(draft?.misses ?? 0);
  const tag = `g3-l${String(level ?? 0).padStart(2, "0")}`;

  const building = phase === "build" || phase === "show" || phase === "locked";
  const dims = phase === "build" ? constrain(childDims, LIMITS) : { rows: pz.rows, cols: pz.cols };

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev && Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1 ? prev : { w: width, h: height }));
  }, []);

  const onDims = useCallback((rows: number, cols: number) => {
    setChildDims({ rows, cols });
    sfx.snap(rows * cols);
  }, []);
  const onGrab = useCallback(() => setGrabbed(true), []);

  const miss = (line: string, clip: string) => {
    missesRef.current += 1;
    sfx.release();
    onStruggle();
    setFeedback(line);
    narration.prompt(line, clip);
  };

  const checkArray = () => {
    if (phase !== "build") return;
    const kind = missKind(dims, pz);
    onAttempt?.({ target: pz.count, answer: dims.rows * dims.cols, correct: kind === null });
    if (kind) {
      onDraft?.({ misses: missesRef.current + 1, rows: dims.rows, cols: dims.cols });
      if (missesRef.current + 1 >= SHOW_AFTER_MISSES) {
        setChildDims({ rows: pz.rows, cols: pz.cols });
        setGrabbed(true);
        setPhase("show");
        miss(showLine(pz), `${tag}-show`);
        for (let row = 1; row <= pz.rows; row += 1) {
          schedule(() => {
            setShownRows(row);
            sfx.snap(row * pz.cols);
          }, SHOW_START_MS + (row - 1) * SHOW_ROW_MS);
        }
        schedule(() => {
          setFeedback(null);
          setShownRows(0);
          setPhase("count");
        }, SHOW_START_MS + pz.rows * SHOW_ROW_MS + 900);
      } else {
        miss(missLine(kind, pz), `${tag}-miss-${kind}`);
      }
      return;
    }
    setFeedback(null);
    setPhase("locked");
    sfx.groupPulse();
    schedule(() => sfx.sparkle(), 220);
    schedule(() => setPhase("count"), LOCK_HOLD_MS);
  };

  const onTapRow = useCallback(
    (row: number) => {
      if (phase !== "count" || counted.includes(row)) return;
      const next = [...counted, row];
      setCounted(next);
      sfx.snap(next.length * pz.cols);
      narration.number(next.length * pz.cols);
      if (next.length === pz.rows) schedule(() => setPhase("answer"), ASK_DELAY_MS);
    },
    [counted, phase, pz.cols, pz.rows, schedule],
  );

  const pickAnswer = (n: number) => {
    if (phase !== "answer") return;
    const correct = n === pz.count;
    onAttempt?.({ target: pz.count, answer: n, correct });
    if (!correct) {
      miss(recountLine(pz), `${tag}-recount`);
      return;
    }
    setFeedback(null);
    setPhase("solved");
    sfx.solved();
    schedule(onSolved, SOLVED_AT_MS);
  };

  useEffect(() => {
    const counting = !building;
    onDraft?.(counting ? { misses: missesRef.current, regrouping: true, picked: counted } : { misses: missesRef.current, rows: childDims.rows, cols: childDims.cols });
  }, [onDraft, building, counted, childDims]);

  const spoken = useMemo(() => boardLine(phase, pz, tag), [phase, pz, tag]);
  useEffect(() => {
    if (!spoken || waiting) return;
    narration.prompt(spoken.text, spoken.clip);
  }, [spoken, waiting]);
  useEffect(() => () => narration.stop(), []);

  const stageW = size ? size.w - 24 : 0;
  const stageH = size ? size.h - GOAL_H - EQ_H - FOOT_H - 24 : 0;
  const buildPitch = Math.floor(Math.max(26, Math.min(72, (stageW - SKIP_W) / MAX_COLS, stageH / MAX_ROWS)));

  return (
    <View style={styles.root} onLayout={onLayout} testID={`g3-board-l${level ?? 0}-${pz.rows}x${pz.cols}`}>
      {size ? (
        <>
          <View style={[styles.center, { height: GOAL_H }]}>
            <GoalPill pz={pz} phase={phase} feedback={feedback} />
          </View>

          <View style={[styles.center, { height: EQ_H }]}>
            <Equation pz={pz} phase={phase} />
          </View>

          <View style={[styles.center, styles.stage]}>
            {building ? (
              <ArrayBuilder
                pz={pz}
                dims={dims}
                item={item}
                pitch={buildPitch}
                palActive={palActive}
                locked={phase === "locked" || phase === "show"}
                countedRows={phase === "show" ? shownRows : undefined}
                hinting={!grabbed}
                reduced={reduced}
                onDims={onDims}
                onGrab={onGrab}
              />
            ) : (
              <Animated.View entering={FADE}>
                <CountBeds pz={pz} item={item} counted={counted} width={stageW} height={stageH} disabled={phase !== "count"} onTapRow={onTapRow} />
              </Animated.View>
            )}
          </View>

          <View style={[styles.center, { height: FOOT_H }]}>
            {phase === "build" ? <DoneButton count={dims.rows * dims.cols} onPress={checkArray} /> : null}
            {phase === "answer" ? (
              <Animated.View entering={FADE} style={partStyles.choices}>
                {answerChoices(pz).map((n) => (
                  <Pressable
                    key={n}
                    onPress={() => pickAnswer(n)}
                    accessibilityRole="button"
                    accessibilityLabel={`${n} seeds`}
                    style={({ pressed }) => [partStyles.choice, pressed ? styles.pressed : null]}
                  >
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

/** What Brijo says as each step starts. Nothing while the array locks or once it is solved. */
function boardLine(phase: Phase, pz: Puzzle, tag: string): { text: string; clip: string } | null {
  if (phase === "build") return { text: `Build ${pz.rows} rows of ${pz.cols}. Drag the corner, then tap Done.`, clip: `${tag}-build` };
  if (phase === "count") return { text: countLine, clip: `${tag}-count` };
  if (phase === "answer") return { text: askLine(pz), clip: `${tag}-how` };
  return null;
}

/** The goal for this step, or, after a mistake, what to change. */
function GoalPill({ pz, phase, feedback }: Readonly<{ pz: Puzzle; phase: Phase; feedback: string | null }>) {
  const building = phase === "build" || phase === "show" || phase === "locked";
  let label = `${pz.rows} rows of ${pz.cols} make ${pz.count} seeds!`;
  if (feedback) {
    label = feedback;
  } else if (building) {
    label = `Build ${pz.rows} rows of ${pz.cols}`;
  } else if (phase === "count") {
    label = countLine;
  } else if (phase === "answer") {
    label = "How many seeds?";
  }
  return (
    <View style={[styles.pill, feedback ? styles.pillTry : null]} accessibilityLiveRegion="polite">
      {building && !feedback ? (
        <View style={{ width: pz.cols * 9, height: pz.rows * 9 }}>
          {Array.from({ length: pz.rows * pz.cols }, (_, i) => (
            <View key={i} style={[styles.dot, { left: (i % pz.cols) * 9, top: Math.floor(i / pz.cols) * 9 }]} />
          ))}
        </View>
      ) : null}
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function Equation({ pz, phase }: Readonly<{ pz: Puzzle; phase: Phase }>) {
  const known = phase === "solved";
  const tile = 42;
  const font = 24;
  const op = (sign: string) => <Text style={styles.op}>{sign}</Text>;
  return (
    <View
      style={[styles.strip, known ? styles.stripWin : null]}
      accessible
      accessibilityLabel={known ? `${pz.rows} times ${pz.cols} equals ${pz.count}` : `${pz.rows} times ${pz.cols} equals what?`}
    >
      <NumberTile value={pz.rows} tone="total" size={tile} fontSize={font} />
      {op("×")}
      <NumberTile value={pz.cols} tone="five" size={tile} fontSize={font} />
      {op("=")}
      <NumberTile value={known ? pz.count : "?"} tone={known ? "win" : "ask"} size={tile} fontSize={font} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 12, paddingVertical: 12 },
  center: { alignItems: "center", justifyContent: "center" },
  stage: { flex: 1 },
  pressed: { transform: [{ scale: 0.96 }] },
  pill: { maxWidth: "100%", flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.white, borderRadius: 24, borderWidth: 3, borderColor: colors.atMintDeep, paddingHorizontal: 16, paddingVertical: 6 },
  pillTry: { borderColor: colors.atYellow, backgroundColor: colors.atCream, flexShrink: 1 },
  pillText: { flexShrink: 1, fontFamily: fonts.bodySemiBold, fontSize: 16, lineHeight: 20, color: colors.atInk, textAlign: "center" },
  dot: { position: "absolute", width: 7, height: 7, borderRadius: 2, backgroundColor: colors.atTealLight },
  strip: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.white, borderRadius: 999, borderWidth: 3, borderColor: colors.atMintDeep, paddingHorizontal: 18, paddingVertical: 6 },
  stripWin: { borderColor: "#E0A800", backgroundColor: colors.atCream },
  op: { fontFamily: fonts.bodyBold, fontSize: 24, color: colors.atInk },
});

/** Picks up where the child left off: still building, or counting with some rows already tapped. */
function resumeArray(draft: LevelDraft | undefined, rows: number): { counting: boolean; dims: Dims; counted: number[] } {
  const counted = (draft?.picked ?? []).filter((r, i, all) => Number.isInteger(r) && r >= 0 && r < rows && all.indexOf(r) === i).slice(0, rows - 1);
  const dims = {
    rows: Math.min(MAX_ROWS, Math.max(1, Math.round(draft?.rows ?? 1))),
    cols: Math.min(MAX_COLS, Math.max(1, Math.round(draft?.cols ?? 1))),
  };
  return { counting: draft?.regrouping === true, dims, counted: draft?.regrouping ? counted : [] };
}
