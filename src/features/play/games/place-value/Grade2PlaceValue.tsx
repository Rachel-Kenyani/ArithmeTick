/**
 * Grade 2 — tens and ones (KICD Grade 2, 1.1 place value, 1.3 addition and 1.4 subtraction with regrouping).
 * A ten is a full ten-frame (the Grade 1 white frame); a one is an item left over. The child sees "full frames"
 * and "left over"; the equation names them tens and ones.
 *   build — PackTens: fill frames, then say how many full frames and how many left over.
 *   add   — `a` is on the mat and `b` new items (ringed purple) arrive; "Fill a frame" moves ten left over onto
 *           a frame before the child answers.
 *   sub   — the child taps a side of the mat to give `b` away into Brijo's basket; when too few are left over,
 *           "Empty a frame" tips a full frame out into ten. Then the child answers how many are left.
 * The two sides of the mat are the touch targets (not each small item), so every target stays at least 48 px.
 * Feedback (no error text, as in Grade 1): a wrong answer counts the mat aloud, full frames first (10, 20, 30…).
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { FadeIn, ReduceMotion, ZoomIn, ZoomOut } from "react-native-reanimated";

import BasketArt from "@/components/illustrations/BasketArt";
import { sfx } from "@/services/audio";
import type { PlaceValueProps } from "@/types/domain";
import { colors, fonts } from "@/theme";

import { COUNT_STEP_MS } from "../ten-frame/constants";
import { useScheduler } from "../ten-frame/hooks/useScheduler";
import PackTens from "./PackTens";
import { Crate, Equation, Loose, Prompt, TARGET, partStyles, type Bubble } from "./parts";

type Step = "regroup" | "take" | "answer" | "solved";

interface Piece {
  id: number;
  /** Arrived as the `b` part of an addition (ringed purple). */
  fresh?: boolean;
}

const DRAFT_VERSION = 1;
const SOLVED_HANDOFF_MS = 1400;
const POP = ZoomIn.springify().stiffness(380).damping(20).reduceMotion(ReduceMotion.System);
const OUT = ZoomOut.duration(200).reduceMotion(ReduceMotion.System);

/** Piece ids only need to be unique (they key the pop-in / pop-out animations). */
let pieceId = 0;
const make = (n: number, fresh = false): Piece[] => Array.from({ length: n }, () => ({ id: pieceId++, fresh }));

/** Three answer tiles: the answer, the classic regrouping slip (± 10) and a near miss, in order. */
function choicesFor(answer: number, op: PlaceValueProps["op"]): number[] {
  const slip = op === "add" ? answer - 10 : answer + 10;
  const near = answer + (answer % 2 === 0 ? 1 : -1);
  return [...new Set([answer, slip, near].filter((n) => n >= 0))].sort((x, y) => x - y);
}

export default function Grade2PlaceValue(props: Readonly<PlaceValueProps>) {
  if (props.op === "build") return <PackTens {...props} />;
  return <AddSub {...props} />;
}

function AddSub({ level, op, a, b, item = "tomato", palActive,
  waiting = false, onStruggle, onAttempt, onSolved, draft, onDraft }: Readonly<PlaceValueProps>) {
  const schedule = useScheduler();
  const answer = op === "add" ? a + b : a - b;
  const [crates, setCrates] = useState<Piece[]>(() => make(Math.floor(a / 10)));
  const [loose, setLoose] = useState<Piece[]>(() => [...make(a % 10), ...(op === "add" ? make(b, true) : [])]);
  const [givenCrates, setGivenCrates] = useState(0);
  const [givenLoose, setGivenLoose] = useState(0);
  const [step, setStep] = useState<Step>(() => (op === "sub" ? "take" : (a % 10) + b >= 10 ? "regroup" : "answer"));
  const [misses, setMisses] = useState(draft?.version === DRAFT_VERSION ? draft.misses : 0);
  const [bubbles, setBubbles] = useState<Partial<Record<number, Bubble>>>({});
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const doneRef = useRef(false);

  const cratesToGive = Math.floor(b / 10);
  const looseToGive = b % 10;

  useEffect(() => {
    onDraft?.({ version: DRAFT_VERSION, misses });
  }, [onDraft, misses]);

  /** Count the mat aloud: full frames first (10, 20, 30…), then the loose ones. Returns when it ends. */
  const countAloud = () => {
    const order = [...crates.map((p) => ({ p, by: 10 })), ...loose.map((p) => ({ p, by: 1 }))];
    setBubbles((prev) => {
      const next = { ...prev };
      let total = 0;
      order.forEach(({ p, by }, i) => {
        total += by;
        next[p.id] = { label: total, delayMs: i * COUNT_STEP_MS, n: (prev[p.id]?.n ?? 0) + 1 };
      });
      return next;
    });
    order.forEach((_, i) => schedule(() => sfx.snap(i), i * COUNT_STEP_MS));
    return order.length * COUNT_STEP_MS;
  };

  /* ---- add: ten left over go onto a frame ---- */
  const packCrate = () => {
    if (loose.length < 10) return sfx.nudge();
    setLoose((l) => l.slice(10));
    setCrates((c) => [...c, ...make(1)]);
    sfx.bundle();
    if (step === "regroup") schedule(() => setStep("answer"), 500);
  };

  /* ---- sub: give away into the basket, emptying a frame when too few are left over ---- */
  const canOpen = step === "take" && loose.length < looseToGive - givenLoose && crates.length > cratesToGive - givenCrates;
  const openCrate = () => {
    if (!canOpen) return sfx.nudge();
    setCrates((c) => c.slice(0, -1));
    setLoose((l) => [...l, ...make(10)]);
    sfx.bundle();
  };
  const gave = (nextCrates: number, nextLoose: number) => {
    if (nextCrates === cratesToGive && nextLoose === looseToGive) {
      sfx.groupPulse();
      schedule(() => setStep("answer"), 400);
    }
  };
  const giveCrate = () => {
    if (step !== "take" || givenCrates >= cratesToGive || !crates.length) return sfx.nudge();
    setCrates((c) => c.slice(0, -1));
    setGivenCrates(givenCrates + 1);
    sfx.pickup();
    gave(givenCrates + 1, givenLoose);
  };
  const giveLoose = () => {
    if (step !== "take" || givenLoose >= looseToGive || !loose.length) return sfx.nudge();
    setLoose((l) => l.slice(0, -1));
    setGivenLoose(givenLoose + 1);
    sfx.pickup();
    gave(givenCrates, givenLoose + 1);
  };

  const pick = (n: number) => {
    if (step !== "answer" || doneRef.current) return;
    const correct = n === answer;
    onAttempt?.({ target: answer, answer: n, correct });
    if (!correct) {
      setMisses((m) => m + 1);
      sfx.nudge();
      schedule(onStruggle, countAloud());
      return;
    }
    doneRef.current = true;
    setStep("solved");
    const end = countAloud();
    schedule(() => sfx.solved(), end);
    schedule(onSolved, end + SOLVED_HANDOFF_MS);
  };

  /* ---- layout ---- */
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev && Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1 ? prev : { w: width, h: height }));
  };
  // Loose items sit 5 to a row (like the ten-frame) in the right half of the mat.
  const unit = size ? Math.floor(Math.max(20, Math.min(34, (size.w - 60) / 2 / 5 - 3, (size.h - (op === "sub" ? 320 : 260)) / 4))) : 28;
  const crateCell = Math.max(7, Math.round(unit * 0.32));
  const choices = useMemo(() => choicesFor(answer, op), [answer, op]);
  const tappable = step === "take";
  const prompt = promptFor(step, op, b, canOpen, answer);

  return (
    <View style={styles.root} onLayout={onLayout} testID={`g2-placevalue-l${level ?? 0}-${op}-${a}-${b}`}>
      {size ? (
        <>
          {op === "sub" ? (
            <View style={styles.basket} accessible accessibilityLabel={`${givenCrates * 10 + givenLoose} in Brijo's basket`}>
              <View style={styles.basketArt}>
                <BasketArt />
              </View>
              <Text style={styles.basketCount}>{givenCrates * 10 + givenLoose}</Text>
            </View>
          ) : null}

          <Equation op={op} a={a} b={b} answer={answer} solved={step === "solved"} />

          <Prompt text={prompt} clipId={promptClipFor(step, op, canOpen, level ?? 0)} waiting={waiting} silent={step === "solved"} />

          <View style={styles.mat}>
            <Side
              label={"Full crates"}
              hint={palActive && op === "sub" ? `Give ${cratesToGive}` : undefined}
              onPress={tappable ? giveCrate : undefined}
              a11y={tappable ? `${crates.length} full crates. Tap to give a full frame to Brijo` : `${crates.length} full frames`}
            >
              <View style={styles.crates}>
                {crates.map((p) => (
                  <Animated.View key={p.id} entering={POP} exiting={OUT}>
                    <Crate item={item} cell={crateCell} bubble={bubbles[p.id]} />
                  </Animated.View>
                ))}
              </View>
            </Side>
            <View style={styles.divider} />
            <Side
              label="Left over"
              hint={palActive && op === "sub" ? `Give ${looseToGive}` : undefined}
              onPress={tappable ? giveLoose : undefined}
              a11y={tappable ? `${loose.length} left over. Tap to give one to Brijo` : `${loose.length} left over`}
              alert={loose.length >= 10 && step !== "solved"}
            >
              <View style={[styles.loose, { width: 5 * unit + 4 * 3 }]}>
                {loose.map((p) => (
                  <Animated.View key={p.id} entering={POP} exiting={OUT}>
                    <Loose item={item} size={unit} fresh={p.fresh} bubble={bubbles[p.id]} />
                  </Animated.View>
                ))}
              </View>
            </Side>
          </View>

          <View style={styles.actions}>
            {step === "regroup" ? <ActionButton label="Fill a crate" onPress={packCrate} /> : null}
            {canOpen ? <ActionButton label="Empty a crate" onPress={openCrate} /> : null}
            {step === "answer" ? (
              <Animated.View entering={FadeIn.duration(220)} style={partStyles.choices}>
                {choices.map((n) => (
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

/** The recording for each instruction; the "give" line names the level's number, so it is recorded per level. */
function promptClipFor(step: Step, op: PlaceValueProps["op"], canOpen: boolean, level: number): string {
  if (step === "regroup") return "pv-regroup";
  if (step === "take") return canOpen ? "pv-empty" : `g2-l${String(level).padStart(2, "0")}-give`;
  return op === "add" ? "pv-altogether" : "pv-left";
}

function promptFor(step: Step, op: PlaceValueProps["op"], b: number, canOpen: boolean, answer: number): string {
  switch (step) {
    case "regroup":
      return "Ten left over? Put them in a crate!";
    case "take":
      return canOpen ? "Not enough left over. Empty a full crate!" : `Tap to give ${b} to Brijo`;
    case "answer":
      return op === "add" ? "How many altogether?" : "How many are left?";
    default:
      return `${answer}!`;
  }
}

function Side({
  label,
  hint,
  onPress,
  a11y,
  alert,
  children,
}: Readonly<{ label: string; hint?: string; onPress?: () => void; a11y: string; alert?: boolean; children: ReactNode }>) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={a11y}
      style={({ pressed }) => [styles.side, onPress ? styles.sideTap : null, alert ? styles.sideAlert : null, pressed ? styles.pressed : null]}
    >
      <Text style={partStyles.head}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {children}
    </Pressable>
  );
}

function ActionButton({ label, onPress }: Readonly<{ label: string; onPress: () => void }>) {
  return (
    <Animated.View entering={FadeIn.duration(220)}>
      <Pressable onPress={onPress} accessibilityRole="button" style={styles.action}>
        <Text style={styles.actionText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 12 },
  basket: { flexDirection: "row", alignItems: "center", gap: 8 },
  basketArt: { width: 72, height: 44 },
  basketCount: { fontFamily: fonts.bodyBold, fontSize: 24, color: colors.atInk, minWidth: 32 },
  mat: {
    flexDirection: "row",
    alignSelf: "stretch",
    backgroundColor: colors.atCream,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.atMintDeep,
    padding: 8,
  },
  divider: { width: 2, backgroundColor: colors.atMintDeep, marginHorizontal: 6 },
  side: { flex: 1, alignItems: "center", gap: 6, borderRadius: 14, padding: 6, minHeight: TARGET, borderWidth: 2, borderColor: "transparent" },
  sideTap: { borderColor: colors.atTealLight, borderStyle: "dashed", backgroundColor: "rgba(255,255,255,0.6)" },
  sideAlert: { borderColor: colors.atYellow, borderStyle: "solid" },
  pressed: { transform: [{ scale: 0.98 }] },
  hint: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.atPurple },
  crates: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
  loose: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 3 },
  actions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 10, minHeight: TARGET },
  action: { minHeight: TARGET, paddingHorizontal: 18, justifyContent: "center", borderRadius: 999, backgroundColor: colors.atPurple, borderWidth: 3, borderColor: colors.white },
  actionText: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.white },
});
