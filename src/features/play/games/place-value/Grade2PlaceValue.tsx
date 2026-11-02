/**
 * Grade 2 — tens and ones (KICD Grade 2, 1.1 place value, 1.3 addition and 1.4 subtraction with regrouping).
 * A ten is a full crate (the Grade 1 white ten-frame). The ones always sit in one open crate, so 27 is two full
 * crates and an open crate holding 7: the child can see it is 3 short of 30.
 *   build — PackTens: fill crates, then say how many full crates and how many left over.
 *   add   — counting on, which is how a Grade 2 child adds: the `b` new items (purple) go into the open crate one
 *           by one (tap or drag), each showing the running total (28, 29, 30…). When the crate fills it joins the
 *           full crates (a ten is made: the regrouping) and the rest start a new open crate (31, 32).
 *   sub   — counting back: the child taps the open crate to give its items to Brijo one by one (31, 30…), or a
 *           full crate to give a whole ten. When the open crate is empty and more must go, tapping a full crate
 *           opens it: ten ones again (the regrouping, the other way).
 * Then the child answers. Feedback (no error text, as in Grade 1): a wrong answer counts the mat aloud, full
 * crates first (10, 20, 30, then 31, 32).
 */

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
/** A full crate joins the shelf after this beat, so the child sees it full first. */
const FULL_BEAT_MS = 450;
const POP = ZoomIn.springify().stiffness(380).damping(20).reduceMotion(ReduceMotion.System);
const OUT = ZoomOut.duration(200).reduceMotion(ReduceMotion.System);

/** Three answer tiles: the answer, the classic regrouping slip (± 10) and a near miss, in order. */
function choicesFor(answer: number, op: PlaceValueProps["op"]): number[] {
  const slip = op === "add" ? answer - 10 : answer + 10;
  const near = answer + (answer % 2 === 0 ? 1 : -1);
  return [...new Set([answer, slip, near].filter((n) => n >= 0))].sort((x, y) => x - y);
}

/** "tomatoes", "mangoes", "flowers", "bottle tops". */
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
  /** Items in the open crate (0–10): the ones. */
  const [open, setOpen] = useState(a % 10);
  /** Addition: new items still to move in. */
  const [incoming, setIncoming] = useState(op === "add" ? b : 0);
  /** Subtraction: how many have gone into Brijo's basket. */
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
  // Subtraction plan: give `cratesToGive` whole tens, then the ones from the open crate.
  const cratesToGive = Math.floor(b / 10);
  const cratesGiven = Math.min(cratesToGive, Math.floor(given / 10));
  const onesToGive = b % 10;
  const onesGiven = given - cratesGiven * 10;
  const giveCrate = op === "sub" && step === "move" && cratesGiven < cratesToGive;
  const mustOpen = op === "sub" && step === "move" && !giveCrate && open === 0 && onesGiven < onesToGive;

  useEffect(() => {
    onDraft?.({ version: DRAFT_VERSION, misses });
  }, [onDraft, misses]);

  /** Show the running total over one slot of the open crate, or over a full crate. */
  const show = (key: string, label: number) => {
    bubbleN.current += 1;
    const n = bubbleN.current;
    setBubbles((prev) => ({ ...prev, [key]: { label, delayMs: 0, n } }));
  };

  const finishMoving = () => {
    sfx.groupPulse();
    schedule(() => setStep("answer"), 600);
  };

  /* ---- add: count on into the open crate ---- */
  const moveIn = () => {
    if (op !== "add" || step !== "move" || waiting || busyRef.current || incoming <= 0) return;
    const nowOpen = open + 1;
    const left = incoming - 1;
    sfx.snap(nowOpen - 1);
    setIncoming(left);
    setOpen(nowOpen);
    show(`open-${nowOpen - 1}`, full * 10 + nowOpen);
    if (nowOpen === 10) {
      // A ten is made: the full crate joins the others, and a new open crate starts.
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
  /** A dragged item counts when it is let go over the open crate (with a little give around its edge). */
  const dropIn = (x: number, y: number) => {
    crateRef.current?.measureInWindow((fx, fy, fw, fh) => {
      const give = 24;
      if (x >= fx - give && x <= fx + fw + give && y >= fy - give && y <= fy + fh + give) moveIn();
    });
  };

  /* ---- sub: count back out of the open crate ---- */
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
    // Open a full crate: it becomes the open crate, ten ones again.
    sfx.bundle();
    setFull(full - 1);
    setOpen(10);
    show(`open-9`, total);
  };

  /** Count the mat aloud: full crates first (10, 20, 30…), then the open crate's ones. Returns when it ends. */
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

  /* ---- layout ---- */
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

          {/* Full crates: each is one ten. In a subtraction, tap one to give it away or open it. */}
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

          {/* The open crate holds the ones */}
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

          {/* Addition: the new items, waiting to be counted on */}
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

/** The recording for each instruction; the "give" line names the level's number, so it is recorded per level. */
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
