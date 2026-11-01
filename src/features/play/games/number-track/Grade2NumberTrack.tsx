/**
 * Grade 2, "Count back" (KICD Grade 2, 1.2: counting backward from 50). Ten stepping stones from `from` down,
 * in two rows of 5 like the ten-frame, with some numbers missing. The next missing stone glows; the child picks
 * its number from three tiles. Brijo reads the instruction aloud.
 * Feedback (no error text, as in Grade 1), in tiers for each gap: a first wrong pick counts back aloud from the
 * first stone to the gap, each stone hopping in turn; a second shows the number faintly in the gap. The next gap
 * starts without a hint. The usual slip (counting forward
 * instead of back) is always one of the choices.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { FadeIn, ReduceMotion, ZoomIn, useAnimatedStyle, useReducedMotion, useSharedValue } from "react-native-reanimated";

import { sfx } from "@/services/audio";
import { narration } from "@/services/narration";
import type { NumberTrackProps } from "@/types/domain";
import { colors, fonts } from "@/theme";

import { Prompt, TARGET, partStyles } from "../place-value/parts";
import { useScheduler } from "../ten-frame/hooks/useScheduler";
import { keyframes } from "../ten-frame/utils/motion";

const STONES = 10;
/** Slower than the Grade 1 count, so each number can be said aloud before the next stone hops. */
const COUNT_STEP_MS = 1200;
const DRAFT_VERSION = 1;
const SOLVED_HANDOFF_MS = 1400;
const POP = ZoomIn.springify().stiffness(380).damping(20).reduceMotion(ReduceMotion.System);

/** Three choices in counting-back order: the answer, one less, and the counting-forward slip (one more than the stone before). */
function choicesFor(answer: number): number[] {
  return [answer + 2, answer, answer - 1];
}

export default function Grade2NumberTrack({ level, from, gaps, waiting = false, onStruggle, onAttempt, onSolved, draft, onDraft }: Readonly<NumberTrackProps>) {
  const schedule = useScheduler();
  const reduced = useReducedMotion();
  const numbers = useMemo(() => Array.from({ length: STONES }, (_, i) => from - i), [from]);
  const missing = useMemo(() => numbers.filter((n) => gaps.includes(n)), [numbers, gaps]);
  // Resume: the gaps already filled stay filled.
  const [filled, setFilled] = useState<number[]>(() =>
    draft?.version === DRAFT_VERSION ? (draft.picked ?? []).filter((n) => missing.includes(n)) : [],
  );
  const [misses, setMisses] = useState(draft?.version === DRAFT_VERSION ? draft.misses : 0);
  /** Misses on the gap being filled now: help is per gap, so the next gap starts without a hint. */
  const [missesHere, setMissesHere] = useState(0);
  const [hops, setHops] = useState<Partial<Record<number, { n: number; delayMs: number }>>>({});
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const doneRef = useRef(false);

  const next = missing.find((n) => !filled.includes(n));
  const solved = next === undefined;

  useEffect(() => {
    onDraft?.({ version: DRAFT_VERSION, misses, picked: filled });
  }, [onDraft, misses, filled]);

  /** Hop the stones from the first up to (not including) `until`, one by one, saying each number aloud. */
  const countBack = (until: number) => {
    const run = numbers.filter((n) => n > until);
    setHops((prev) => {
      const nextHops = { ...prev };
      run.forEach((n, i) => {
        nextHops[n] = { n: (prev[n]?.n ?? 0) + 1, delayMs: i * COUNT_STEP_MS };
      });
      return nextHops;
    });
    run.forEach((n, i) => schedule(() => narration.number(n), i * COUNT_STEP_MS));
    return run.length * COUNT_STEP_MS;
  };

  const pick = (n: number) => {
    if (next === undefined || doneRef.current || waiting) return;
    const correct = n === next;
    onAttempt?.({ target: next, answer: n, correct });
    if (!correct) {
      setMisses((m) => m + 1);
      setMissesHere((m) => m + 1);
      sfx.nudge();
      schedule(onStruggle, countBack(next));
      return;
    }
    sfx.snap(STONES - 1 - numbers.indexOf(n));
    setMissesHere(0);
    const nowFilled = [...filled, n];
    setFilled(nowFilled);
    if (nowFilled.length < missing.length) return;
    doneRef.current = true;
    const end = countBack(numbers[STONES - 1] - 1);
    schedule(() => sfx.solved(), end);
    schedule(onSolved, end + SOLVED_HANDOFF_MS);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev && Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1 ? prev : { w: width, h: height }));
  };
  const stone = size ? Math.floor(Math.max(TARGET, Math.min(72, (size.w - 24 - 4 * 10) / 5, (size.h - 260) / 2.6))) : 56;
  const choices = next === undefined ? [] : choicesFor(next);

  const prompt = solved ? `You counted back from ${from}!` : filled.length ? "What number comes next?" : `Count back from ${from}. Which number is missing?`;
  const promptClip = filled.length ? "nt-next" : `g2-l${String(level ?? 0).padStart(2, "0")}-missing`;

  return (
    <View style={styles.root} onLayout={onLayout} testID={`g2-numbertrack-l${level ?? 0}-${from}`}>
      {size ? (
        <>
          <Prompt text={prompt} clipId={promptClip} waiting={waiting} silent={solved} />

          <View style={styles.track} accessible accessibilityLabel={`Counting back from ${from}`}>
            {[0, 1].map((row) => (
              <View key={row} style={styles.row}>
                {numbers.slice(row * 5, row * 5 + 5).map((n) => {
                  const gap = missing.includes(n) && !filled.includes(n);
                  return (
                    <Stone
                      key={n}
                      n={n}
                      size={stone}
                      gap={gap}
                      active={n === next}
                      justFilled={filled.includes(n)}
                      hint={missesHere >= 2 && n === next}
                      solved={solved}
                      hop={hops[n]}
                      reduced={reduced}
                    />
                  );
                })}
              </View>
            ))}
          </View>


          <View style={styles.actions}>
            {next !== undefined ? (
              <Animated.View key={next} entering={FadeIn.duration(220)} style={partStyles.choices}>
                {choices.map((c) => (
                  <Pressable key={c} onPress={() => pick(c)} accessibilityRole="button" accessibilityLabel={String(c)} style={partStyles.choice}>
                    <Text style={partStyles.choiceText}>{c}</Text>
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

/** One stepping stone: its number, or a dashed "?" while missing (glowing when it's the one to fill). */
function Stone({
  n,
  size,
  gap,
  active,
  justFilled,
  hint,
  solved,
  hop,
  reduced,
}: Readonly<{
  n: number;
  size: number;
  gap: boolean;
  active: boolean;
  justFilled: boolean;
  hint: boolean;
  solved: boolean;
  hop?: { n: number; delayMs: number };
  reduced: boolean;
}>) {
  const y = useSharedValue(0);
  useEffect(() => {
    if (!hop) return;
    y.set(keyframes(reduced ? [0, -4, 0] : [0, -16, 0, -6, 0], 700, hop.delayMs));
  }, [hop, reduced, y]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));

  return (
    <Animated.View
      style={[
        styles.stone,
        { width: size, height: size, borderRadius: size * 0.3 },
        gap ? styles.gap : null,
        active ? styles.active : null,
        justFilled ? styles.filled : null,
        solved ? styles.win : null,
        st,
      ]}
      accessible
      accessibilityLabel={gap ? (active ? "Missing number, fill this one" : "Missing number") : String(n)}
    >
      {gap ? (
        <Text style={[styles.num, styles.ask, { fontSize: size * 0.42 }, hint ? styles.ghost : null]}>{hint ? n : "?"}</Text>
      ) : (
        <Animated.Text entering={justFilled ? POP : undefined} style={[styles.num, { fontSize: size * 0.42 }]}>
          {n}
        </Animated.Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 12 },
  track: { gap: 10, padding: 10, borderRadius: 24, backgroundColor: colors.atCream, borderWidth: 3, borderColor: colors.atMintDeep },
  row: { flexDirection: "row", gap: 10 },
  stone: { alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderWidth: 3, borderColor: "rgba(0,79,74,0.2)" },
  gap: { backgroundColor: colors.atMint, borderStyle: "dashed", borderColor: "rgba(0,111,104,0.55)" },
  active: { borderColor: colors.atYellow, borderStyle: "solid", borderWidth: 4, backgroundColor: colors.atYellowSoft },
  filled: { borderColor: colors.atTeal, backgroundColor: colors.atGlow },
  win: { borderColor: "#E0A800" },
  num: { fontFamily: fonts.bodyBold, color: colors.atInk },
  ask: { color: colors.atTeal },
  ghost: { opacity: 0.35 },
  actions: { minHeight: TARGET, alignItems: "center", justifyContent: "center" },
});
