import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { FadeIn, ReduceMotion, ZoomIn, ZoomOut } from "react-native-reanimated";

import BasketArt from "@/components/illustrations/BasketArt";
import type { CounterItem } from "@/features/play/components/CounterFace";
import { sfx } from "@/services/audio";
import type { PlaceValueProps } from "@/types/domain";
import { colors, fonts } from "@/theme";

import { COUNT_STEP_MS } from "../ten-frame/constants";
import { useScheduler } from "../ten-frame/hooks/useScheduler";
import { DragItem } from "./DragItem";
import PackTens from "./PackTens";
import { Crate, Equation, Loose, Prompt, TARGET, partStyles, type Bubble } from "./parts";

type Step = "move" | "answer" | "solved";

const DRAFT_VERSION = 2;
const SOLVED_HANDOFF_MS = 1400;
const FULL_BEAT_MS = 450;
const POP = ZoomIn.springify().stiffness(380).damping(20).reduceMotion(ReduceMotion.System);
const OUT = ZoomOut.duration(200).reduceMotion(ReduceMotion.System);

function choicesFor(answer: number, op: PlaceValueProps["op"]): number[] {
  const slip = op === "add" ? answer - 10 : answer + 10;
  const near = answer + (answer % 2 === 0 ? 1 : -1);
  return [...new Set([answer, slip, near].filter((n) => n >= 0))].sort((x, y) => x - y);
}

function plural(item: CounterItem): string {
  if (item === "cap") return "bottle tops";
  return item === "tomato" || item === "mango" ? `${item}es` : `${item}s`;
}

export default function Grade2PlaceValue(props: Readonly<PlaceValueProps>) {
  if (props.op === "build") return <PackTens {...props} />;
  return <AddSub {...props} />;
}

function AddSub({ level, op, a, b, item = "tomato", palActive, waiting = false, onStruggle, onAttempt, onSolved, draft, onDraft }: Readonly<PlaceValueProps>) {
  const schedule = useScheduler();
  const answer = op === "add" ? a + b : a - b;
  const [full, setFull] = useState(Math.floor(a / 10));
  const [open, setOpen] = useState(a % 10);
  const [incoming, setIncoming] = useState(op === "add" ? b : 0);
  const [given, setGiven] = useState(0);
  const [step, setStep] = useState<Step>("move");
  const [misses, setMisses] = useState(draft?.version === DRAFT_VERSION ? draft.misses : 0);
  const [bubbles, setBubbles] = useState<Partial<Record<string, Bubble>>>({});
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const busyRef = useRef(false);
  const doneRef = useRef(false);
  const crateRef = useRef<ComponentRef<typeof View>>(null);
  const bubbleN = useRef(0);

  const total = full * 10 + open;
  const cratesToGive = Math.floor(b / 10);
  const cratesGiven = Math.min(cratesToGive, Math.floor(given / 10));
  const onesToGive = b % 10;
  const onesGiven = given - cratesGiven * 10;
  const giveCrate = op === "sub" && step === "move" && cratesGiven < cratesToGive;
  const mustOpen = op === "sub" && step === "move" && !giveCrate && open === 0 && onesGiven < onesToGive;

  useEffect(() => {
    onDraft?.({ version: DRAFT_VERSION, misses });
  }, [onDraft, misses]);

  const show = (key: string, label: number) => {
    bubbleN.current += 1;
    const n = bubbleN.current;
    setBubbles((prev) => ({ ...prev, [key]: { label, delayMs: 0, n } }));
  };

  const finishMoving = () => {
    sfx.groupPulse();
    schedule(() => setStep("answer"), 600);
  };

  const moveIn = () => {
    if (op !== "add" || step !== "move" || waiting || busyRef.current || incoming <= 0) return;
    const nowOpen = open + 1;
    const left = incoming - 1;
    sfx.snap(nowOpen - 1);
    setIncoming(left);
    setOpen(nowOpen);
    show(`open-${nowOpen - 1}`, full * 10 + nowOpen);
    if (nowOpen === 10) {
      busyRef.current = true;
      schedule(() => {
        sfx.bundle();
        setFull((f) => f + 1);
        setOpen(0);
        busyRef.current = false;
        if (left === 0) finishMoving();
      }, FULL_BEAT_MS);
      return;
    }
    if (left === 0) finishMoving();
  };
  const dropIn = (x: number, y: number) => {
    crateRef.current?.measureInWindow((fx, fy, fw, fh) => {
      const give = 24;
      if (x >= fx - give && x <= fx + fw + give && y >= fy - give && y <= fy + fh + give) moveIn();
    });
  };

  const giveOne = () => {
    if (op !== "sub" || step !== "move" || waiting || busyRef.current) return;
    if (giveCrate || open === 0 || onesGiven >= onesToGive) return sfx.nudge();
    sfx.pickup();
    const nowGiven = given + 1;
    setGiven(nowGiven);
    setOpen(open - 1);
    show(`open-${open - 1}`, total - 1);
    if (nowGiven === b) finishMoving();
  };
  const tapFull = () => {
    if (op !== "sub" || step !== "move" || waiting || busyRef.current) return;
    if (giveCrate) {
      sfx.pickup();
      const nowGiven = given + 10;
      setGiven(nowGiven);
      setFull(full - 1);
      if (nowGiven === b) finishMoving();
      return;
    }
    if (!mustOpen) return sfx.nudge();
    sfx.bundle();
    setFull(full - 1);
    setOpen(10);
    show(`open-9`, total);
  };

  const countAloud = () => {
    const keys = [...Array.from({ length: full }, (_, i) => `full-${i}`), ...Array.from({ length: open }, (_, i) => `open-${i}`)];
    setBubbles((prev) => {
      const next = { ...prev };
      keys.forEach((k, i) => {
        bubbleN.current += 1;
        next[k] = { label: i < full ? (i + 1) * 10 : full * 10 + (i - full) + 1, delayMs: i * COUNT_STEP_MS, n: bubbleN.current };
      });
      return next;
    });
    keys.forEach((_, i) => schedule(() => sfx.snap(i), i * COUNT_STEP_MS));
    return keys.length * COUNT_STEP_MS;
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

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev && Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1 ? prev : { w: width, h: height }));
  };
  const cell = size ? Math.floor(Math.max(26, Math.min(44, (size.w - 60) / 5.6, (size.h - (op === "sub" ? 330 : 300)) / 3.4))) : 36;
  const smallCell = Math.max(8, Math.round(cell * 0.3));
  const choices = useMemo(() => choicesFor(answer, op), [answer, op]);
  const prompt = promptFor(step, op, b, mustOpen, giveCrate, plural(item), answer);
  const clip = promptClipFor(step, op, mustOpen, giveCrate, level ?? 0);
  const openTappable = op === "sub" && step === "move" && !giveCrate && open > 0;
  const fullTappable = giveCrate || mustOpen;

  return (
    <View style={styles.root} onLayout={onLayout} testID={`g2-placevalue-l${level ?? 0}-${op}-${a}-${b}`}>
      {size ? (
        <>
          {op === "sub" ? (
            <View style={styles.basket} accessible accessibilityLabel={`${given} in Brijo's basket`}>
              <View style={styles.basketArt}>
                <BasketArt />
              </View>
              <Text style={styles.basketCount}>{given}</Text>
            </View>
          ) : null}

          <Equation op={op} a={a} b={b} answer={answer} solved={step === "solved"} />
          <Prompt text={prompt} clipId={clip} waiting={waiting} silent={step === "solved"} />

          <View style={styles.shelf}>
            <Text style={partStyles.head}>{"Full\ncrates"}</Text>
            <View style={styles.shelfCrates}>
              {Array.from({ length: full }, (_, i) => (
                <Animated.View key={`full-${i}`} entering={POP} exiting={OUT}>
                  <Pressable
                    onPress={tapFull}
                    disabled={!fullTappable}
                    hitSlop={8}
                    accessibilityRole={fullTappable ? "button" : "image"}
                    accessibilityLabel={giveCrate ? "Full crate. Tap to give it to Brijo" : mustOpen ? "Full crate. Tap to open it" : "Full crate, ten"}
                    style={[styles.fullTap, fullTappable ? styles.fullTapOn : null]}
                  >
                    <Crate item={item} cell={smallCell} bubble={bubbles[`full-${i}`]} />
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </View>

          <View style={styles.openRow}>
            <Text style={partStyles.head}>Left over</Text>
            <Pressable
              ref={crateRef}
              collapsable={false}
              onPress={giveOne}
              disabled={!openTappable}
              accessibilityRole={openTappable ? "button" : "image"}
              accessibilityLabel={openTappable ? `Crate with ${open}. Tap to give one to Brijo` : `Crate with ${open}`}
              style={[styles.openTap, openTappable ? styles.fullTapOn : null]}
            >
              <Crate item={item} cell={cell} filled={open} glow={palActive && (op === "add" || openTappable)} countAt={(slot) => bubbles[`open-${slot}`]} />
            </Pressable>
          </View>

          {op === "add" && incoming > 0 ? (
            <View style={styles.incoming}>
              {Array.from({ length: incoming }, (_, i) => (
                <DragItem
                  key={`in-${b - incoming + i}`}
                  enabled={step === "move" && !waiting}
                  onTap={moveIn}
                  onDrop={dropIn}
                  hitSlop={Math.max(0, Math.ceil((TARGET - cell) / 2))}
                  label={`New ${item === "cap" ? "bottle top" : item}. Tap or drag it into the crate`}
                >
                  <Loose item={item} size={cell} fresh />
                </DragItem>
              ))}
            </View>
          ) : null}

          <View style={styles.actions}>
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

function promptClipFor(step: Step, op: PlaceValueProps["op"], mustOpen: boolean, giveCrate: boolean, level: number): string {
  if (step === "move") {
    if (op === "add") return "pv-count-on";
    if (mustOpen) return "pv-open";
    if (giveCrate) return "pv-give-crate";
    return `g2-l${String(level).padStart(2, "0")}-give`;
  }
  return op === "add" ? "pv-altogether" : "pv-left";
}

function promptFor(step: Step, op: PlaceValueProps["op"], b: number, mustOpen: boolean, giveCrate: boolean, many: string, answer: number): string {
  if (step === "move") {
    if (op === "add") return `Put the new ${many} in the crate. Count on!`;
    if (mustOpen) return "The crate is empty. Tap a full crate to open it!";
    if (giveCrate) return "Tap a full crate to give ten to Brijo";
    return `Tap the crate to give ${b % 10} to Brijo. Count back!`;
  }
  if (step === "answer") return op === "add" ? `How many ${many} are there altogether?` : "How many are left?";
  return `${answer}!`;
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 12 },
  basket: { flexDirection: "row", alignItems: "center", gap: 8 },
  basketArt: { width: 72, height: 44 },
  basketCount: { fontFamily: fonts.bodyBold, fontSize: 24, color: colors.atInk, minWidth: 32 },
  shelf: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "stretch",
    minHeight: TARGET,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.atCream,
    borderWidth: 2,
    borderColor: colors.atMintDeep,
  },
  shelfCrates: { flexDirection: "row", flexWrap: "wrap", gap: 8, flex: 1 },
  fullTap: { padding: 4, borderRadius: 10, borderWidth: 2, borderColor: "transparent", minHeight: TARGET, justifyContent: "center" },
  fullTapOn: { borderColor: colors.atTealLight, borderStyle: "dashed" },
  openRow: { alignItems: "center", gap: 4 },
  openTap: { padding: 4, borderRadius: 18, borderWidth: 2, borderColor: "transparent" },
  incoming: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
  actions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 10, minHeight: TARGET },
});
