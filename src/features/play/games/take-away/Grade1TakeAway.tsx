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

const DRAFT_VERSION = 3;
const SLOTS = Array.from({ length: 10 }, (_, i) => i);
const SOLVED_HANDOFF_MS = 1400;
const TAKE_STEP_MS = 700;
const TAKE_START_MS = 500;
const POP_IN = ZoomIn.springify()
  .stiffness(380)
  .damping(20)
  .reduceMotion(ReduceMotion.System);
const paletteFor = (i: number) => (i % 3 === 2 ? "purple" : "teal");

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

  const awaySlots = useMemo(() => SLOTS.slice(start - away, start), [start, away]);
  const resumed = draft?.version === DRAFT_VERSION && draft.regrouping === true;
  const [taken, setTaken] = useState<number[]>(() => (resumed ? awaySlots : []));
  const [step, setStep] = useState<Step>(resumed ? "count" : "watch");
  const [misses, setMisses] = useState(resumed ? (draft?.misses ?? 0) : 0);
  const talliedRef = useRef<number[]>([]);
  const [fx, setFx] = useState<Partial<Record<number, Fx>>>({});
  const { layout: L, onLayout } = useBoardLayout();
  const cell = L.cap;
  const sg = L.sectionGap;
  const doneRef = useRef(false);
  const [hinting, setHinting] = useState(false);

  useEffect(() => {
    onDraft?.({ version: DRAFT_VERSION, misses, regrouping: step !== "watch" });
  }, [onDraft, misses, step]);

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

  const tally = useCallback(
    (slot: number) => {
      if (step !== "count") return;
      if (talliedRef.current.includes(slot)) return;
      const next = [...talliedRef.current, slot];
      talliedRef.current = next;
      fire([slot], "count", () => 0, () => next.length);
      sfx.snap(next.length - 1);
    },
    [step, fire],
  );

  const remaining = SLOTS.filter((s) => s < start && !taken.includes(s));

  const pick = (n: number) => {
    if (step !== "count" || doneRef.current) return;
    const correct = n === left;
    onAttempt?.({ target: left, answer: n, correct });
    if (!correct) {
      setMisses((m) => m + 1);
      talliedRef.current = [];
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
      <WhiteTenFrame
        cell={L.cell}
        gap={L.gap}
        pad={L.framePad}
        win={step === "solved"}
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
  onPress?: (slot: number) => void;
  label: string;
}

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

function Equation({
  start,
  away,
  left,
  step,
}: Readonly<{ start: number; away: number; left: number; step: Step }>) {
  const tile = 46;
  const font = 26;
  const awayKnown = step !== "watch";
  const awayWord = awayKnown ? away : "what";
  const solved = step === "solved";
  const op = (s: string) => <Text style={styles.op}>{s}</Text>;
  return (
    <View
      style={[styles.strip, solved ? styles.stripWin : null]}
      accessible
      accessibilityLabel={
        solved
          ? `${start} take away ${away} equals ${left}`
          : `${start} take away ${awayWord} equals what?`
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
