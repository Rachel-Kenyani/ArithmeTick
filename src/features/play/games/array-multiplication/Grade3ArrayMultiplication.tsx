/**
 * Grade 3 — "Array Multiplication & Place-Value Regrouping" (native port of arithmetick/components/Grade3ArrayMultiplication.tsx)
 * Puzzle `rows × cols` (default 3 × 4 = 12 → 1 ten + 2 ones; levels use 3×4, 2×6, 3×5, 4×3).
 *
 * Phase A (build):   stretch the array from its corner, then tap Done to check it. A wrong size lets
 *                    Stealth PAL step in (rows lock, columns stop at the target, rows band with skip counts).
 * Phase B (regroup): tap 10 tiles; each fills one slot of the ten-rod. At 10 they bundle into 1 ten and the
 *                    rest drop into Ones. With help on, the first tap in a row grabs the whole row.
 *
 * Built for budget phones: no shadows, no per-tile animated values, the drag maths stays on the UI thread.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { FadeIn, ReduceMotion, useReducedMotion } from "react-native-reanimated";

import { sfx } from "@/services/audio";
import type { ArrayProps, LevelDraft } from "@/types/domain";
import { colors, fonts } from "@/theme";

import { DoneButton } from "../ten-frame/components/DoneButton";
import { NumberTile } from "../ten-frame/components/NumberTile";
import { useScheduler } from "../ten-frame/hooks/useScheduler";
import { ArrayBuilder, SKIP_W } from "./ArrayBuilder";
import { RegroupBoard, regroupGeometry } from "./RegroupBoard";
import { MAX_COLS, MAX_ROWS, TEN, constrain, dimLimits, isTarget, normalizePuzzle, pickTile, type Dims } from "./logic";

type Phase = "build" | "locked" | "regroup" | "bundled";

const LOCK_HOLD_MS = 1000;
const BUNDLE_DELAY_MS = 380;
const FUSE_AT_MS = 650;
const SOLVED_AT_MS = 1600;
const GOAL_H = 52;
const EQ_H = 64;
const DONE_H = 64;
const FADE = FadeIn.duration(260).reduceMotion(ReduceMotion.System);

export default function Grade3ArrayMultiplication({ level, rows: targetRows, cols: targetCols, palActive, onStruggle, onAttempt, onSolved, draft, onDraft }: Readonly<ArrayProps>) {
  const pz = useMemo(() => normalizePuzzle(targetRows, targetCols), [targetRows, targetCols]);
  const reduced = useReducedMotion();
  const schedule = useScheduler();
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  // Resume: carry on building at the saved size, or picking with the saved tiles.
  const [resumed] = useState(() => resumeArray(draft, pz.count));
  const [phase, setPhase] = useState<Phase>(resumed.regrouping ? "regroup" : "build");
  const [childDims, setChildDims] = useState<Dims>(resumed.dims);
  const [grabbed, setGrabbed] = useState(resumed.dims.rows * resumed.dims.cols > 1);
  const [picked, setPicked] = useState<number[]>(resumed.picked);
  const pickedRef = useRef<number[]>(resumed.picked);
  const missesRef = useRef(draft?.misses ?? 0);
  const bundleRef = useRef(0);
  const doneRef = useRef(false);

  // Help never resets progress: it is a constraint applied on top of the child's size.
  const dims = phase === "build" ? constrain(childDims, dimLimits(pz, palActive)) : { rows: pz.rows, cols: pz.cols };

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev && Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1 ? prev : { w: width, h: height }));
  }, []);

  const onDims = useCallback((rows: number, cols: number) => {
    setChildDims({ rows, cols });
    sfx.snap(rows * cols);
  }, []);
  const onGrab = useCallback(() => setGrabbed(true), []);

  const checkArray = () => {
    if (phase !== "build") return;
    const correct = isTarget(dims, pz);
    onAttempt?.({ target: pz.count, answer: dims.rows * dims.cols, correct });
    if (!correct) {
      missesRef.current += 1;
      onDraft?.({ misses: missesRef.current, rows: dims.rows, cols: dims.cols });
      sfx.release();
      onStruggle();
      return;
    }
    setPhase("locked");
    sfx.groupPulse();
    schedule(() => sfx.sparkle(), 220);
    schedule(() => setPhase("regroup"), LOCK_HOLD_MS);
  };

  const onTap = useCallback(
    (tile: number) => {
      if (doneRef.current) return;
      const result = pickTile(pickedRef.current, tile, pz.cols, palActive);
      if (result.refused) {
        sfx.nudge();
        onStruggle();
        return;
      }
      const grew = result.picked.length > pickedRef.current.length;
      pickedRef.current = result.picked;
      setPicked(result.picked);
      if (grew) sfx.snap(result.picked.length - 1);
      else sfx.release();

      // Reaching 10 bundles after a short beat — unless a tile goes back first.
      bundleRef.current += 1;
      if (result.picked.length !== TEN) return;
      const ticket = bundleRef.current;
      schedule(() => {
        if (ticket !== bundleRef.current || doneRef.current) return;
        doneRef.current = true;
        setPhase("bundled");
        sfx.bundle();
        schedule(() => sfx.solved(), FUSE_AT_MS);
        schedule(onSolved, SOLVED_AT_MS);
      }, BUNDLE_DELAY_MS);
    },
    [onSolved, onStruggle, palActive, pz.cols, schedule],
  );

  useEffect(() => {
    const regrouping = phase !== "build" && phase !== "locked";
    onDraft?.(regrouping ? { misses: missesRef.current, regrouping, picked } : { misses: missesRef.current, rows: childDims.rows, cols: childDims.cols });
  }, [onDraft, phase, picked, childDims]);

  /* ─────────────── layout ─────────────── */

  const building = phase === "build" || phase === "locked";
  const stageW = size ? size.w - 24 : 0;
  const stageH = size ? size.h - GOAL_H - EQ_H - DONE_H - 24 : 0;
  const buildPitch = Math.floor(Math.max(26, Math.min(72, (stageW - SKIP_W) / MAX_COLS, stageH / MAX_ROWS)));
  const regroupGeo = useMemo(() => regroupGeometry(stageW, stageH + DONE_H, pz), [stageW, stageH, pz]);

  return (
    <View style={styles.root} onLayout={onLayout} testID={`g3-board-l${level ?? 0}-${pz.rows}x${pz.cols}`}>
      {size ? (
        <>
          <View style={[styles.goal, { height: GOAL_H }]}>
            <GoalPill rows={pz.rows} cols={pz.cols} phase={phase} />
          </View>

          <View style={[styles.center, { height: EQ_H }]}>
            <Equation pz={pz} phase={phase} />
          </View>

          <View style={[styles.center, styles.stage]}>
            {building ? (
              <ArrayBuilder
                pz={pz}
                dims={dims}
                pitch={buildPitch}
                palActive={palActive}
                locked={phase === "locked"}
                hinting={!grabbed}
                reduced={reduced}
                onDims={onDims}
                onGrab={onGrab}
              />
            ) : (
              <Animated.View entering={FADE}>
                <RegroupBoard pz={pz} geo={regroupGeo} picked={picked} bundled={phase === "bundled"} palActive={palActive} onTap={onTap} />
              </Animated.View>
            )}
          </View>

          <View style={[styles.center, { height: building ? DONE_H : 0 }]}>
            {phase === "build" ? <DoneButton count={dims.rows * dims.cols} onPress={checkArray} /> : null}
          </View>
        </>
      ) : null}
    </View>
  );
}

/** "Build 3 × 4" while building, then "Make a ten" — one short line, never a paragraph. */
function GoalPill({ rows, cols, phase }: Readonly<{ rows: number; cols: number; phase: Phase }>) {
  const building = phase === "build" || phase === "locked";
  const label = building ? `Build ${rows} rows of ${cols}` : phase === "bundled" ? "1 ten!" : "Tap 10 to make a ten";
  return (
    <View style={styles.pill} accessibilityLiveRegion="polite">
      {building ? (
        <View style={{ width: cols * 9, height: rows * 9 }}>
          {Array.from({ length: rows * cols }, (_, i) => (
            <View key={i} style={[styles.dot, { left: (i % cols) * 9, top: Math.floor(i / cols) * 9 }]} />
          ))}
        </View>
      ) : null}
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

/** "3 × 4 = ?" → "3 × 4 = 12" once the array is right → "12 = 1 ten + 2 ones" once it is bundled. */
function Equation({ pz, phase }: Readonly<{ pz: ReturnType<typeof normalizePuzzle>; phase: Phase }>) {
  const known = phase !== "build";
  const tile = 42;
  const font = 24;
  const op = (sign: string) => <Text style={styles.op}>{sign}</Text>;
  if (phase === "bundled") {
    return (
      <View style={[styles.strip, styles.stripWin]} accessible accessibilityLabel={`${pz.count} equals 1 ten and ${pz.ones} ones`}>
        <NumberTile value={pz.count} tone="win" size={tile} fontSize={font} />
        {op("=")}
        <Text style={styles.word}>1 ten</Text>
        {op("+")}
        <Text style={styles.word}>{`${pz.ones} ${pz.ones === 1 ? "one" : "ones"}`}</Text>
      </View>
    );
  }
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
  goal: { alignItems: "center", justifyContent: "center" },
  pill: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.white, borderRadius: 999, borderWidth: 3, borderColor: colors.atMintDeep, paddingHorizontal: 16, paddingVertical: 6 },
  pillText: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.atInk },
  dot: { position: "absolute", width: 7, height: 7, borderRadius: 2, backgroundColor: colors.atTealLight },
  strip: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.white, borderRadius: 999, borderWidth: 3, borderColor: colors.atMintDeep, paddingHorizontal: 18, paddingVertical: 6 },
  stripWin: { borderColor: "#E0A800", backgroundColor: colors.atCream },
  op: { fontFamily: fonts.bodyBold, fontSize: 24, color: colors.atInk },
  word: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.atInk },
});

/** A saved Grade 3 board, checked against the puzzle (anything odd starts fresh). */
function resumeArray(draft: LevelDraft | undefined, count: number): { regrouping: boolean; dims: Dims; picked: number[] } {
  const picked = (draft?.picked ?? []).filter((t, i, all) => Number.isInteger(t) && t >= 0 && t < count && all.indexOf(t) === i).slice(0, TEN - 1);
  const rows = Math.min(MAX_ROWS, Math.max(1, Math.round(draft?.rows ?? 1)));
  const cols = Math.min(MAX_COLS, Math.max(1, Math.round(draft?.cols ?? 1)));
  return { regrouping: draft?.regrouping === true, dims: { rows, cols }, picked: draft?.regrouping ? picked : [] };
}
