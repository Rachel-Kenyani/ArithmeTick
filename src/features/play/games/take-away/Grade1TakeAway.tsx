/**
 * Grade 1 — "Take away" (KICD Grade 1, 1.6 Subtraction: subtraction as removal, then count what is left).
 * Puzzle: `start` items sit on the ten-frame; the child moves `away` of them into Brijo's basket, then says
 * how many are left.
 *
 * Top to bottom: Brijo's basket, the equation, Done, then the ten-frame. Tap an item or drag it up into the
 * basket; tap it in the basket or drag it down to put it back.
 *
 * Feedback (no error text, same as Level 1): a wrong Done counts the basket aloud — items hop with a white
 * number bubble and a rising note. Too many: the count stops at the target and the extras wobble. Too few:
 * from the second miss the count carries on into numbered ghost items in the basket. A wrong "how many left?"
 * counts the items still on the frame, every time.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  GestureDetector,
  useCompetingGestures,
  usePanGesture,
  useTapGesture,
} from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  ReduceMotion,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import BasketArt from "@/components/illustrations/BasketArt";
import CounterFace, {
  type CounterItem,
} from "@/features/play/components/CounterFace";
import { sfx } from "@/services/audio";
import type { TakeAwayProps } from "@/types/domain";
import { colors, fonts } from "@/theme";

import { CountBubble } from "../ten-frame/components/CountBubble";
import { DoneButton } from "../ten-frame/components/DoneButton";
import { NumberTile } from "../ten-frame/components/NumberTile";
import { COUNT_STEP_MS, DONE_GAP, DONE_H } from "../ten-frame/constants";
import { useBoardLayout } from "../ten-frame/hooks/useBoardLayout";
import { useScheduler } from "../ten-frame/hooks/useScheduler";
import { styles as frameStyles } from "../ten-frame/styles";
import { EASE_IN_OUT, SPRING_UI, keyframes } from "../ten-frame/utils/motion";

type Step = "take" | "count" | "solved";
type FxKind = "count" | "wobble";
interface Fx {
  kind: FxKind;
  n: number;
  delayMs: number;
  label?: number;
}

/** Bump when the saved board's meaning changes; older drafts start fresh (all items on the frame). */
const DRAFT_VERSION = 2;
const SLOTS = Array.from({ length: 10 }, (_, i) => i);
const SOLVED_HANDOFF_MS = 1400;
/** How far a drag has to travel (towards the basket, or back up to the frame) to count as a move. */
const DRAG_MOVE_PX = 40;
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
  palActive,
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

  // Resume: `placed` holds the frame slots now in the basket, in the order they went in.
  const [taken, setTaken] = useState<number[]>(() =>
    ((draft?.version === DRAFT_VERSION ? draft.placed : undefined) ?? []).filter(
      (s, i, all) =>
        Number.isInteger(s) && s >= 0 && s < start && all.indexOf(s) === i,
    ),
  );
  const [step, setStep] = useState<Step>(draft?.version === DRAFT_VERSION && draft.regrouping ? "count" : "take");
  const [misses, setMisses] = useState(draft?.misses ?? 0);
  const [ghosts, setGhosts] = useState(false);
  const [fx, setFx] = useState<Partial<Record<number, Fx>>>({});
  // Same sizes and spacing as the Count levels (cap size, section gap, equation height).
  const { layout: L, onLayout } = useBoardLayout();
  const cell = L.cap;
  const sg = L.sectionGap;
  const doneRef = useRef(false);
  // While the count-along hint plays on the frame, the frame shows at full strength.
  const [hinting, setHinting] = useState(false);

  useEffect(() => {
    onDraft?.({ version: DRAFT_VERSION, misses, placed: taken, regrouping: step !== "take" });
  }, [onDraft, misses, taken, step]);

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

  const moveToBasket = useCallback(
    (slot: number) => {
      if (step !== "take") return;
      setGhosts(false);
      setTaken((prev) => (prev.includes(slot) ? prev : [...prev, slot]));
      sfx.pickup();
    },
    [step],
  );
  const moveToFrame = useCallback(
    (slot: number) => {
      if (step !== "take") return;
      setGhosts(false);
      setTaken((prev) => prev.filter((s) => s !== slot));
      sfx.release();
    },
    [step],
  );

  const checkTaken = () => {
    const correct = taken.length === away;
    onAttempt?.({ target: away, answer: taken.length, correct });
    if (correct) {
      sfx.groupPulse();
      setGhosts(false);
      setStep("count");
      return;
    }
    const miss = misses + 1;
    setMisses(miss);
    const counted = taken.slice(0, away);
    const end = countAlong(counted);
    if (taken.length > away)
      schedule(() => fire(taken.slice(away), "wobble", () => 0), end);
    // Too few: from the second miss the count carries on into numbered ghosts in the basket.
    else if (miss >= 2) {
      schedule(() => setGhosts(true), end);
      for (let k = taken.length; k < away; k += 1)
        schedule(
          () => sfx.snap(k),
          end + 250 + (k - taken.length) * COUNT_STEP_MS,
        );
    }
    schedule(onStruggle, end);
  };

  const remaining = SLOTS.filter((s) => s < start && !taken.includes(s));

  const pick = (n: number) => {
    if (step !== "count" || doneRef.current) return;
    const correct = n === left;
    onAttempt?.({ target: left, answer: n, correct });
    if (!correct) {
      // Every wrong pick counts what is left on the frame again.
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
  const ghostCount =
    ghosts && step === "take" ? Math.max(0, away - taken.length) : 0;

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
                enabled={step === "take"}
                direction="down"
                onMove={moveToFrame}
                label={`${itemName(item)} in the basket. Tap to put it back`}
              />
            </Animated.View>
          ))}
          {Array.from({ length: ghostCount }, (_, k) => (
            <Animated.View
              key={`ghost-${k}`}
              entering={FadeIn.delay(250 + k * COUNT_STEP_MS)}
              style={[
                frameStyles.ghost,
                frameStyles.center,
                {
                  width: basketItem,
                  height: basketItem,
                  borderRadius: basketItem,
                },
              ]}
            >
              <Text
                style={[
                  frameStyles.ghostNumber,
                  { fontSize: Math.round(basketItem * 0.4) },
                ]}
              >
                {taken.length + k + 1}
              </Text>
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
        {step === "take" ? (
          <DoneButton count={taken.length} onPress={checkTaken} />
        ) : null}
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
      <View
        style={[
          styles.frameEdge,
          step === "solved" ? styles.frameEdgeWin : null,
          // Answering "how many left?": the frame steps back so the equation leads, except while it counts as a hint.
          step === "count" && !hinting ? styles.muted : null,
        ]}
      >
        <View
          style={[
            styles.frame,
            { padding: L.framePad, gap: L.gap },
            step === "solved" ? styles.frameWin : null,
          ]}
          accessibilityLabel={`Board with ${remaining.length} left`}
        >
          {[0, 1].map((row) => (
            <View key={row} style={[styles.row, { gap: L.gap }]}>
              {SLOTS.slice(row * 5, row * 5 + 5).map((slot) => (
                <View
                  key={slot}
                  style={[
                    styles.slot,
                    {
                      width: L.cell,
                      height: L.cell,
                      borderRadius: Math.round(L.cell * 0.23),
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.dimple,
                      {
                        width: L.cell * 0.72,
                        height: L.cell * 0.72,
                        borderRadius: L.cell,
                      },
                    ]}
                  />
                  {slot < start && !taken.includes(slot) ? (
                    <Counter
                      item={item}
                      slot={slot}
                      size={cell}
                      fx={fx[slot]}
                      reduced={reduced}
                      enabled={step === "take"}
                      direction="up"
                      onMove={moveToBasket}
                      label={`${itemName(item)} ${slot + 1} on the frame. Tap to put it in the basket`}
                    />
                  ) : null}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
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
  enabled: boolean;
  /** Which way a drag moves it: up into the basket (top), or down back to the frame. */
  direction: "down" | "up";
  onMove: (slot: number) => void;
  label: string;
}

/** One item: tap or drag it to move it; hops / wobbles like a Count-level cap when the board asks. */
function Counter({
  item,
  slot,
  size,
  fx,
  reduced,
  enabled,
  direction,
  onMove,
  label,
}: Readonly<CounterProps>) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const fy = useSharedValue(0);
  const rot = useSharedValue(0);
  const lift = useSharedValue(1);

  useEffect(() => {
    if (!fx) return;
    if (fx.kind === "wobble")
      rot.set(keyframes([0, -14, 12, -8, 5, 0], 550, fx.delayMs, EASE_IN_OUT));
    else
      fy.set(
        keyframes(reduced ? [0, -4, 0] : [0, -18, 0, -7, 0], 750, fx.delayMs),
      );
  }, [fx, reduced, fy, rot]);

  const move = () => onMove(slot);
  const pan = usePanGesture({
    enabled,
    maxPointers: 1,
    minDistance: 10,
    onActivate: () => {
      lift.set(withSpring(1.12, SPRING_UI));
    },
    onUpdate: (e) => {
      tx.set(e.translationX);
      ty.set(e.translationY);
    },
    onFinalize: () => {
      const dy = ty.get();
      const far = direction === "down" ? dy > DRAG_MOVE_PX : dy < -DRAG_MOVE_PX;
      lift.set(withSpring(1, SPRING_UI));
      tx.set(withSpring(0, SPRING_UI));
      ty.set(withSpring(0, SPRING_UI));
      if (far) scheduleOnRN(move);
    },
  });
  const tap = useTapGesture({
    enabled,
    onDeactivate: (e) => {
      if (!e.canceled) scheduleOnRN(move);
    },
  });
  const gesture = useCompetingGestures(pan, tap);

  const st = useAnimatedStyle(() => ({
    zIndex: lift.get() > 1 ? 10 : 0,
    transform: [
      { translateX: tx.get() },
      { translateY: ty.get() + fy.get() },
      { rotate: `${rot.get()}deg` },
      { scale: lift.get() },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel={label}
        onAccessibilityTap={move}
        style={[{ width: size, height: size }, st]}
      >
        <CounterFace
          item={item}
          palette={paletteFor(slot)}
          size={size * 0.92}
        />
        {fx?.kind === "count" && fx.label ? (
          <CountBubble
            key={fx.n}
            label={fx.label}
            delayMs={fx.delayMs}
            size={size}
          />
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

/** "7 − ? = ?" → "7 − 2 = ?" once the right number is in the basket → "7 − 2 = 5" (gold) when counted. */
function Equation({
  start,
  away,
  left,
  step,
}: Readonly<{ start: number; away: number; left: number; step: Step }>) {
  const tile = 46;
  const font = 26;
  const awayKnown = step !== "take";
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
  // the white ten-frame of the Count levels
  frameEdge: {
    borderRadius: 24,
    paddingBottom: 6,
    backgroundColor: colors.atInk,
  },
  frameEdgeWin: { backgroundColor: "#C48A00" },
  frame: {
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: "rgba(0,79,74,0.2)",
  },
  frameWin: { borderColor: colors.atYellow },
  row: { flexDirection: "row" },
  slot: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.atMint,
    borderWidth: 2,
    borderColor: "rgba(0,111,104,0.14)",
  },
  dimple: { position: "absolute", backgroundColor: "rgba(255,255,255,0.75)" },
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
