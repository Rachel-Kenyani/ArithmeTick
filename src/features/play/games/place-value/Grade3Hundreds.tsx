import { useEffect, useRef, useState, type ComponentRef } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { ReduceMotion, ZoomIn } from "react-native-reanimated";

import type { CounterItem } from "@/features/play/components/CounterFace";
import { sfx } from "@/services/audio";
import type { HundredsProps } from "@/types/domain";
import { colors, fonts } from "@/theme";

import { CountBubble } from "../ten-frame/components/CountBubble";
import { COUNT_STEP_MS } from "../ten-frame/constants";
import { useScheduler } from "../ten-frame/hooks/useScheduler";
import { DragItem } from "./DragItem";
import { Choices } from "./PackTensParts";
import PlaceValueChart from "./PlaceValueChart";
import { Crate, Loose, Prompt, TARGET, partStyles, type Bubble } from "./parts";
import { inside, sameSize } from "./packTensLogic";
import { CRATE_GAP, CRATES_PER_BOX, crateLayout, crateSlot, hundredsClip, hundredsPrompt, nextAsk, splitHundreds, type AskStep, type HundredsStep } from "./hundredsLogic";

const DRAFT_VERSION = 1;
const CLOSE_MS = 450;
const AUTO_STEP_MS = 140;
const SOLVED_HANDOFF_MS = 1600;
const POP = ZoomIn.springify().stiffness(380).damping(20).reduceMotion(ReduceMotion.System);

export default function Grade3Hundreds({ level, a, item = "mango", palActive, waiting = false, onStruggle, onAttempt, onSolved, draft, onDraft }: Readonly<HundredsProps>) {
  const schedule = useScheduler();
  const answers = splitHundreds(a);
  const [packed, setPacked] = useState<number[]>([]);
  const [inBox, setInBox] = useState(0);
  const [boxes, setBoxes] = useState(0);
  const [handFilled, setHandFilled] = useState(false);
  const [step, setStep] = useState<HundredsStep>("pack");
  const [misses, setMisses] = useState(draft?.version === DRAFT_VERSION ? draft.misses : 0);
  const [bubbles, setBubbles] = useState<Partial<Record<string, Bubble>>>({});
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const closingRef = useRef(false);
  const boxRef = useRef(0);
  const doneRef = useRef(false);
  const frameRef = useRef<ComponentRef<typeof View>>(null);

  const remaining = answers.crates - packed.length;

  useEffect(() => {
    onDraft?.({ version: DRAFT_VERSION, misses });
  }, [onDraft, misses]);

  const pack = (crate: number) => {
    if (step !== "pack" || waiting || closingRef.current || boxRef.current >= CRATES_PER_BOX) return;
    sfx.snap(boxRef.current);
    boxRef.current += 1;
    setPacked((prev) => (prev.includes(crate) ? prev : [...prev, crate]));
    setInBox(boxRef.current);
  };

  useEffect(() => {
    if (inBox < CRATES_PER_BOX || closingRef.current) return;
    closingRef.current = true;
    schedule(() => {
      sfx.bundle();
      setBoxes((n) => n + 1);
      boxRef.current = 0;
      setInBox(0);
      setHandFilled(true);
      closingRef.current = false;
    }, CLOSE_MS);
  }, [inBox, schedule]);

  useEffect(() => {
    if (step !== "pack" || closingRef.current || remaining + inBox >= CRATES_PER_BOX) return;
    sfx.groupPulse();
    schedule(() => setStep("hundreds"), 500);
  }, [step, remaining, inBox, schedule]);

  const dropOnBox = (crate: number, x: number, y: number) => {
    frameRef.current?.measureInWindow((fx, fy, fw, fh) => {
      if (inside(x, y, fx, fy, fw, fh)) pack(crate);
    });
  };

  const autoFill = () => {
    if (step !== "pack" || waiting || closingRef.current) return;
    if (!handFilled) {
      sfx.nudge();
      return;
    }
    const need = CRATES_PER_BOX - inBox;
    const next = Array.from({ length: answers.crates }, (_, i) => i).filter((i) => !packed.includes(i)).slice(0, need);
    if (next.length < need) return;
    next.forEach((crate, k) => schedule(() => pack(crate), k * AUTO_STEP_MS));
  };

  const keysFor = (what: AskStep) => {
    if (what === "hundreds") return Array.from({ length: boxes }, (_, i) => `b${i}`);
    if (what === "tens") return Array.from({ length: answers.crates }, (_, i) => i).filter((i) => !packed.includes(i)).map((i) => `c${i}`);
    return Array.from({ length: answers.ones }, (_, i) => `o${i}`);
  };

  const countAloud = (what: AskStep) => {
    const keys = keysFor(what);
    setBubbles((prev) => {
      const next = { ...prev };
      keys.forEach((k, i) => {
        next[k] = { label: i + 1, delayMs: i * COUNT_STEP_MS, n: (prev[k]?.n ?? 0) + 1 };
      });
      return next;
    });
    keys.forEach((_, i) => schedule(() => sfx.snap(i), i * COUNT_STEP_MS));
    return keys.length * COUNT_STEP_MS;
  };

  const answer = (n: number) => {
    if (doneRef.current || step === "pack" || step === "solved") return;
    const target = answers[step];
    const correct = n === target;
    onAttempt?.({ target, answer: n, correct });
    if (!correct) {
      setMisses((m) => m + 1);
      sfx.nudge();
      schedule(onStruggle, countAloud(step));
      return;
    }
    sfx.groupPulse();
    const next = nextAsk(step);
    setStep(next);
    if (next === "solved") {
      doneRef.current = true;
      schedule(() => sfx.solved(), 300);
      schedule(onSolved, SOLVED_HANDOFF_MS);
    }
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (sameSize(prev, width, height) ? prev : { w: width, h: height }));
  };

  const testID = `g3-hundreds-l${level ?? 0}-${a}`;
  if (!size) return <View style={styles.root} onLayout={onLayout} testID={testID} />;

  const layout = crateLayout(size, answers.crates, step === "pack");
  const shown = (s: AskStep) => ["hundreds", "tens", "ones", "solved"].indexOf(step) > ["hundreds", "tens", "ones"].indexOf(s);

  return (
    <View style={styles.root} onLayout={onLayout} testID={testID}>
      <PlaceValueChart total={a} places={["hundreds", "tens", "ones"]} digits={{ hundreds: shown("hundreds") ? answers.hundreds : undefined, tens: shown("tens") ? answers.tens : undefined, ones: shown("ones") ? answers.ones : undefined }} solved={step === "solved"} />

      <Prompt text={hundredsPrompt(step, handFilled, item, a)} clipId={hundredsClip(step, handFilled)} waiting={waiting} silent={step === "solved"} />

      {boxes > 0 ? (
        <View style={[styles.shelf, step === "hundreds" ? styles.focus : null]} accessible accessibilityLabel={`${boxes} full boxes of one hundred`}>
          {Array.from({ length: boxes }, (_, i) => (
            <Animated.View key={`box-${i + 1}`} entering={POP}>
              <ClosedBox bubble={bubbles[`b${i}`]} />
            </Animated.View>
          ))}
        </View>
      ) : null}

      {step === "pack" ? (
        <View ref={frameRef} collapsable={false}>
          <HundredBox item={item} filled={inBox} glow={handFilled || palActive} onPress={autoFill} />
        </View>
      ) : null}

      <View style={[styles.table, step === "tens" ? styles.focus : null]}>
        {step === "pack" ? null : <Text style={partStyles.head}>Crates of ten</Text>}
        <View style={[styles.crates, { width: layout.cols * crateSlot(layout.cell).w + (layout.cols - 1) * CRATE_GAP }]}>
          {Array.from({ length: answers.crates }, (_, crate) => (
            <View key={`crate-${crate}`} style={{ ...crateSlot(layout.cell), alignItems: "center", justifyContent: "center" }}>
              {packed.includes(crate) ? null : (
                <DragItem enabled={step === "pack"} onTap={() => pack(crate)} onDrop={(x, y) => dropOnBox(crate, x, y)} hitSlop={Math.max(0, Math.ceil((TARGET - crateSlot(layout.cell).h) / 2))} label={step === "pack" ? "Crate of ten. Tap or drag it into the box" : "Crate of ten"}>
                  <Crate item={item} cell={layout.cell} bubble={bubbles[`c${crate}`]} />
                </DragItem>
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.table, styles.onesRow, step === "ones" ? styles.focus : null]}>
        {Array.from({ length: answers.ones }, (_, i) => (
          <Loose key={i} item={item} size={34} bubble={bubbles[`o${i}`]} />
        ))}
      </View>

      {step === "hundreds" || step === "tens" || step === "ones" ? <Choices key={step} unit={step} target={answers[step]} onPick={answer} /> : null}
    </View>
  );
}

function HundredBox({ item, filled, glow, onPress }: Readonly<{ item: CounterItem; filled: number; glow: boolean; onPress: () => void }>) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Box of one hundred, ${filled} of 10 crates`} style={[styles.box, glow ? styles.boxGlow : null]}>
      <View style={styles.boxGrid}>
        {Array.from({ length: CRATES_PER_BOX }, (_, i) => (
          <View key={i} style={styles.boxSlot}>
            {i < filled ? <Crate item={item} cell={5} /> : null}
            {i === filled - 1 ? <CountBubble key={filled} label={filled} delayMs={0} size={22} /> : null}
          </View>
        ))}
      </View>
      <Text style={styles.boxLabel}>100</Text>
    </Pressable>
  );
}

function ClosedBox({ bubble }: Readonly<{ bubble?: Bubble }>) {
  return (
    <View style={styles.closed}>
      <View style={styles.closedLid} />
      <Text style={styles.closedText}>100</Text>
      {bubble ? <CountBubble key={bubble.n} label={bubble.label} delayMs={bubble.delayMs} size={40} /> : null}
    </View>
  );
}

const WOOD = "#c98b4e";
const WOOD_DARK = "#8a5a2b";

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 12 },
  shelf: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, alignSelf: "stretch", minHeight: 52, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14, backgroundColor: colors.atCream, borderWidth: 2, borderColor: colors.atMintDeep },
  table: { alignItems: "center", gap: 4, borderRadius: 14, borderWidth: 2, borderColor: "transparent", padding: 4 },
  onesRow: { flexDirection: "row", gap: 6, minHeight: 44 },
  focus: { borderColor: colors.atYellow, backgroundColor: "rgba(255,229,138,0.25)" },
  crates: { flexDirection: "row", flexWrap: "wrap", gap: CRATE_GAP },
  box: { alignItems: "center", gap: 2, padding: 6, borderRadius: 12, backgroundColor: WOOD, borderWidth: 3, borderColor: WOOD_DARK },
  boxGlow: { shadowColor: colors.atYellow, shadowOpacity: 0.9, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
  boxGrid: { flexDirection: "row", flexWrap: "wrap", width: 5 * 38 },
  boxSlot: { width: 36, height: 20, margin: 1, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.18)", alignItems: "center", justifyContent: "center" },
  boxLabel: { fontFamily: fonts.headingBold, fontSize: 16, color: colors.white },
  closed: { width: 52, height: 40, borderRadius: 8, backgroundColor: WOOD, borderWidth: 3, borderColor: WOOD_DARK, alignItems: "center", justifyContent: "center" },
  closedLid: { position: "absolute", top: 8, left: 0, right: 0, height: 3, backgroundColor: WOOD_DARK },
  closedText: { fontFamily: fonts.headingBold, fontSize: 15, color: colors.white, marginTop: 6 },
  strip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.white, borderRadius: 999, borderWidth: 3, borderColor: colors.atMintDeep, paddingHorizontal: 14, paddingVertical: 6 },
  stripWin: { borderColor: "#E0A800", backgroundColor: colors.atCream },
  op: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.atInk },
  word: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.atInk, marginRight: 4 },
});
