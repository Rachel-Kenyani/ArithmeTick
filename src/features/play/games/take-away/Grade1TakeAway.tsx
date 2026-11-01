/**
 * Grade 1 — "Take away" (KICD Grade 1, 1.6 Subtraction: subtraction as removal, then count what is left).
 * Puzzle: `start` items sit on the ten-frame. Once the story card closes, Brijo puts `away` of them in her
 * basket herself, one by one with a count bubble, exactly as the story says. The child answers the story's
 * question, "how many are left?", and can tap the items still on the frame to count them first.
 *
 * Top to bottom: Brijo's basket, the equation, the answer tiles, then the ten-frame.
 * Feedback (no error text, same as Level 1): a wrong answer counts the items left on the frame aloud — they
 * hop with a white number bubble and a rising note, every time.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  ReduceMotion,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from "react-native-reanimated";

import BasketArt from "@/components/illustrations/BasketArt";
import CounterFace, {
  type CounterItem,
} from "@/features/play/components/CounterFace";
import { sfx } from "@/services/audio";
import type { TakeAwayProps } from "@/types/domain";
import { colors, fonts } from "@/theme";

import { CountBubble } from "../ten-frame/components/CountBubble";
import { NumberTile } from "../ten-frame/components/NumberTile";
import { COUNT_STEP_MS, DONE_GAP, DONE_H } from "../ten-frame/constants";
import { useBoardLayout } from "../ten-frame/hooks/useBoardLayout";
import { WhiteTenFrame } from "../ten-frame/components/WhiteTenFrame";
import { useScheduler } from "../ten-frame/hooks/useScheduler";
import { keyframes } from "../ten-frame/utils/motion";

type Step = "watch" | "count" | "solved";
type FxKind = "count";
interface Fx {
  kind: FxKind;
  n: number;
  delayMs: number;
  label?: number;
}

/** Bump when the saved board's meaning changes; older drafts start fresh (all items on the frame). */
const DRAFT_VERSION = 3;
const SLOTS = Array.from({ length: 10 }, (_, i) => i);
const SOLVED_HANDOFF_MS = 1400;
/** Brijo takes one item every this many ms (a little slower than a count, so each one can be followed). */
const TAKE_STEP_MS = 700;
const TAKE_START_MS = 500;
const POP_IN = ZoomIn.springify()
  .stiffness(380)
  .damping(20)
  .reduceMotion(ReduceMotion.System);
/** Caps alternate teal / purple like the tray, so each one is easy to tell apart. */
const paletteFor = (i: number) => (i % 3 === 2 ? "purple" : "teal");

/** Three answer tiles around the right one (never below 0), in a stable order. */
function choicesFor(left: number, start: number): number[] {
  const set = new Set([
    left,
    Math.max(0, left - 1),
    Math.min(start, left + 1),
    Math.min(start, left + 2),
  ]);
  return [...set].slice(0, 3).sort((a, b) => a - b);
}

export default function Grade1TakeAway({
  level,
  start: startProp,
  away: awayProp,
  waiting = false,
  onStruggle,
  onAttempt,
  onSolved,
  draft,
  onDraft,
  item = "cap",
}: Readonly<TakeAwayProps>) {
  const start = Math.min(10, Math.max(2, Math.round(startProp)));
  const away = Math.min(start - 1, Math.max(1, Math.round(awayProp)));
  const left = start - away;
  const schedule = useScheduler();
  const reduced = useReducedMotion();

  // Brijo takes the last `away` items, the same ones the story card shows leaving.
  const awaySlots = useMemo(() => SLOTS.slice(start - away, start), [start, away]);
  // Resume: once Brijo has taken hers, a returning child goes straight to the question.
  const resumed = draft?.version === DRAFT_VERSION && draft.regrouping === true;
  const [taken, setTaken] = useState<number[]>(() => (resumed ? awaySlots : []));
  const [step, setStep] = useState<Step>(resumed ? "count" : "watch");
  const [misses, setMisses] = useState(resumed ? (draft?.misses ?? 0) : 0);
  /** Frame items the child has tapped to count, in order. */
  const [, setTallied] = useState<number[]>([]);
  const [fx, setFx] = useState<Partial<Record<number, Fx>>>({});
  // Same sizes and spacing as the Count levels (cap size, section gap, equation height).
  const { layout: L, onLayout } = useBoardLayout();
  const cell = L.cap;
  const sg = L.sectionGap;
  const doneRef = useRef(false);
  // While the count-along hint plays on the frame, the frame shows at full strength.
  const [hinting, setHinting] = useState(false);

  useEffect(() => {
    onDraft?.({ version: DRAFT_VERSION, misses, regrouping: step !== "watch" });
  }, [onDraft, misses, step]);

  /** Ask items (by frame slot) to hop / wobble; `labelFor` adds a count bubble. */
  const fire = useCallback(
    (
      ids: readonly number[],
      kind: FxKind,
      delayFor: (i: number) => number,
      labelFor?: (i: number) => number,
    ) => {
      setFx((prev) => {
        const next = { ...prev };
        ids.forEach((id, i) => {
          next[id] = {
            kind,
            n: (prev[id]?.n ?? 0) + 1,
            delayMs: delayFor(i),
            label: labelFor?.(i),
          };
        });
        return next;
      });
    },
    [],
  );

  /** Count `ids` aloud (hop + white bubble + rising note), one every COUNT_STEP_MS. Returns when it ends. */
  const countAlong = useCallback(
    (ids: readonly number[], from = 0) => {
      fire(
        ids,
        "count",
        (i) => i * COUNT_STEP_MS,
        (i) => from + i + 1,
      );
      ids.forEach((_, k) =>
        schedule(() => sfx.snap(from + k), k * COUNT_STEP_MS),
      );
      return ids.length * COUNT_STEP_MS;
    },
    [fire, schedule],
  );

  // Brijo takes hers once the story card is out of the way. Each beat sets the whole basket (not "add one"),
  // and the timers belong to this effect: if it re-runs midway, it simply starts the beats again, so the
  // board always ends with exactly `left` items on it.
  useEffect(() => {
    if (step !== "watch" || waiting) return;
    const timers = awaySlots.map((slot, k) =>
      setTimeout(() => {
        setTaken(awaySlots.slice(0, k + 1));
        sfx.pickup();
        fire([slot], "count", () => 120, () => k + 1);
      }, TAKE_START_MS + k * TAKE_STEP_MS),
    );
    timers.push(
      setTimeout(() => {
        setTaken(awaySlots);
        sfx.groupPulse();
        setStep("count");
      }, TAKE_START_MS + away * TAKE_STEP_MS + 300),
    );
    return () => timers.forEach(clearTimeout);
  }, [step, waiting, awaySlots, away, fire]);

  /** Counting on the frame: each item tapped gets the next number. */
  const tally = useCallback(
    (slot: number) => {
      if (step !== "count") return;
      setTallied((prev) => {
        if (prev.includes(slot)) return prev;
        const next = [...prev, slot];
        fire([slot], "count", () => 0, () => next.length);
        sfx.snap(next.length - 1);
        return next;
      });
    },
    [step, fire],
  );

  const remaining = SLOTS.filter((s) => s < start && !taken.includes(s));

  const pick = (n: number) => {
    if (step !== "count" || doneRef.current) return;
    const correct = n === left;
    onAttempt?.({ target: left, answer: n, correct });
    if (!correct) {
      // Every wrong pick counts what is left on the frame again.
      setMisses((m) => m + 1);
      setTallied([]);
      sfx.nudge();
      setHinting(true);
      const end = countAlong(remaining);
      schedule(() => setHinting(false), end + 600);
      schedule(onStruggle, end);
      return;
    }
    doneRef.current = true;
    setStep("solved");
    countAlong(remaining);
    schedule(() => sfx.solved(), remaining.length * COUNT_STEP_MS);
    schedule(onSolved, remaining.length * COUNT_STEP_MS + SOLVED_HANDOFF_MS);
  };

  const basketItem = Math.round(cell * 0.62);

  return (
    <View
      style={styles.root}
      onLayout={onLayout}
      testID={`g1-takeaway-l${level ?? 0}-${start}-${away}`}
    >
      {/* Brijo's basket at the top: drag items up into it */}
      <View
        style={[
          styles.basket,
          {
            width: Math.min(320, cell * 5 + 40),
            height: Math.round(basketItem * 3.4),
          },
        ]}
        accessible
        accessibilityLabel={`${taken.length} in Brijo's basket`}
      >
        <BasketArt />
        <View style={[styles.basketItems, { top: basketItem * 0.7 }]}>
          {taken.map((slot) => (
            <Animated.View key={slot} entering={POP_IN}>
              <Counter
                item={item}
                slot={slot}
                size={basketItem}
                fx={fx[slot]}
                reduced={reduced}
                label={`${itemName(item)} in Brijo's basket`}
              />
            </Animated.View>
          ))}
        </View>
      </View>

      <View style={{ height: sg }} />
      <View style={{ height: L.eqH, justifyContent: "center" }}>
        <Equation start={start} away={away} left={left} step={step} />
      </View>
      <View style={{ height: DONE_GAP }} />

      <View style={[styles.action, { height: DONE_H }]}>
        {step === "count" ? (
          <Animated.View entering={FadeIn.duration(220)} style={styles.choices}>
            {choicesFor(left, start).map((n) => (
              <Pressable
                key={n}
                onPress={() => pick(n)}
                accessibilityRole="button"
                accessibilityLabel={`${n} left`}
                style={styles.choice}
              >
                <Text style={styles.choiceText}>{n}</Text>
              </Pressable>
            ))}
          </Animated.View>
        ) : null}
      </View>

      <View style={{ height: sg }} />
      {/* the white ten-frame of the Count levels (dark edge underneath), at the bottom */}
      <WhiteTenFrame
        cell={L.cell}
        gap={L.gap}
        pad={L.framePad}
        win={step === "solved"}
        // While Brijo takes hers, the frame steps back so the basket leads.
        style={step === "watch" && !hinting ? styles.muted : null}
        accessibilityLabel={`Board with ${remaining.length} left`}
        renderSlot={(slot) =>
          remaining.includes(slot) ? (
            <Counter
              item={item}
              slot={slot}
              size={cell}
              fx={fx[slot]}
              reduced={reduced}
              onPress={step === "count" ? tally : undefined}
              label={`${itemName(item)} on the frame. Tap to count it`}
            />
          ) : null
        }
      />
    </View>
  );
}

const itemName = (item: CounterItem) =>
  item === "cap" ? "Bottle top" : item[0].toUpperCase() + item.slice(1);

interface CounterProps {
  item: CounterItem;
  slot: number;
  size: number;
  fx?: Fx;
  reduced: boolean;
  /** Tap to count it (frame items, while answering). */
  onPress?: (slot: number) => void;
  label: string;
}

/** One item: hops with a count bubble when counted, by Brijo or by the child's tap. */
function Counter({
  item,
  slot,
  size,
  fx,
  reduced,
  onPress,
  label,
}: Readonly<CounterProps>) {
  const fy = useSharedValue(0);

  useEffect(() => {
    if (!fx) return;
    fy.set(
      keyframes(reduced ? [0, -4, 0] : [0, -18, 0, -7, 0], 750, fx.delayMs),
    );
  }, [fx, reduced, fy]);

  const st = useAnimatedStyle(() => ({
    transform: [{ translateY: fy.get() }],
  }));

  return (
    <Pressable
      disabled={!onPress}
      onPress={() => onPress?.(slot)}
      accessible
      accessibilityRole={onPress ? "button" : "image"}
      accessibilityLabel={label}
    >
      <Animated.View style={[{ width: size, height: size }, st]}>
        <CounterFace
          item={item}
          palette={paletteFor(slot)}
          size={size * 0.92}
        />
        {fx?.label ? (
          <CountBubble
            key={fx.n}
            label={fx.label}
            delayMs={fx.delayMs}
            size={size}
          />
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

/** "7 − ? = ?" → "7 − 2 = ?" once Brijo has taken hers → "7 − 2 = 5" (gold) when answered. */
function Equation({
  start,
  away,
  left,
  step,
}: Readonly<{ start: number; away: number; left: number; step: Step }>) {
  const tile = 46;
  const font = 26;
  const awayKnown = step !== "watch";
  const solved = step === "solved";
  const op = (s: string) => <Text style={styles.op}>{s}</Text>;
  return (
    <View
      style={[styles.strip, solved ? styles.stripWin : null]}
      accessible
      accessibilityLabel={
        solved
          ? `${start} take away ${away} equals ${left}`
          : `${start} take away ${awayKnown ? away : "what"} equals what?`
      }
    >
      <NumberTile value={start} tone="total" size={tile} fontSize={font} />
      {op("−")}
      <NumberTile
        value={awayKnown ? away : "?"}
        tone={awayKnown ? "five" : "ask"}
        size={tile}
        fontSize={font}
      />
      {op("=")}
      <NumberTile
        value={solved ? left : "?"}
        tone={solved ? "win" : "ask"}
        size={tile}
        fontSize={font}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  muted: { opacity: 0.4 },
  strip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.atMintDeep,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  stripWin: { borderColor: "#E0A800", backgroundColor: colors.atCream },
  op: { fontFamily: fonts.bodyBold, fontSize: 26, color: colors.atInk },
  action: { justifyContent: "center" },
  choices: { flexDirection: "row", gap: 12 },
  choice: {
    minWidth: 68,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.atTealLight,
    alignItems: "center",
  },
  choiceText: {
    fontFamily: fonts.bodyBold,
    fontSize: 26,
    color: colors.atTeal,
  },
  basket: { alignItems: "center" },
  basketItems: {
    position: "absolute",
    left: 28,
    right: 28,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 2,
  },
});
