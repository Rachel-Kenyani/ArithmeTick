import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { ReduceMotion, ZoomIn } from "react-native-reanimated";

import { sfx } from "@/services/audio";
import type { GradeModuleProps } from "@/types/domain";
import { colors } from "@/theme";

import { COUNT_STEP_MS } from "../ten-frame/constants";
import { useScheduler } from "../ten-frame/hooks/useScheduler";
import PlaceValueChart from "./PlaceValueChart";
import { Crate, Prompt, partStyles, type Bubble } from "./parts";
import { clipFor, gridFor, inside, itemWord, promptFor, sameSize, type Step } from "./packTensLogic";
import { Choices, LooseSlot, PackCrate } from "./PackTensParts";

const DRAFT_VERSION = 1;
const CLOSE_MS = 450;
const AUTO_STEP_MS = 160;
const SOLVED_HANDOFF_MS = 1400;
const POP = ZoomIn.springify()
  .stiffness(380)
  .damping(20)
  .reduceMotion(ReduceMotion.System);

export default function PackTens({
  level,
  a,
  item = "tomato",
  palActive,
  waiting = false,
  onStruggle,
  onAttempt,
  onSolved,
  draft,
  onDraft,
}: Readonly<GradeModuleProps & { a: number }>) {
  const schedule = useScheduler();
  const tensAnswer = Math.floor(a / 10);
  const onesAnswer = a % 10;

  const [packed, setPacked] = useState<number[]>([]);
  const [inCrate, setInCrate] = useState(0);
  const [shelf, setShelf] = useState(0);
  const [handFilled, setHandFilled] = useState(false);
  const [step, setStep] = useState<Step>("pack");
  const [misses, setMisses] = useState(
    draft?.version === DRAFT_VERSION ? draft.misses : 0,
  );
  const [bubbles, setBubbles] = useState<Partial<Record<string, Bubble>>>({});
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const closingRef = useRef(false);
  const crateRef = useRef(0);
  const doneRef = useRef(false);

  const remaining = a - packed.length;

  useEffect(() => {
    onDraft?.({ version: DRAFT_VERSION, misses });
  }, [onDraft, misses]);

  const pack = (slot: number) => {
    if (step !== "pack" || waiting || closingRef.current) return;
    if (crateRef.current >= 10) return;
    sfx.snap(crateRef.current);
    crateRef.current += 1;
    setPacked((prev) => (prev.includes(slot) ? prev : [...prev, slot]));
    setInCrate(crateRef.current);
  };

  useEffect(() => {
    if (inCrate < 10 || closingRef.current) return;
    closingRef.current = true;
    schedule(() => {
      sfx.bundle();
      setShelf((n) => n + 1);
      crateRef.current = 0;
      setInCrate(0);
      setHandFilled(true);
      closingRef.current = false;
    }, CLOSE_MS);
  }, [inCrate, schedule]);

  useEffect(() => {
    if (step !== "pack" || closingRef.current) return;
    if (remaining + inCrate >= 10) return;
    if (inCrate > 0) {
      closingRef.current = true;
      schedule(() => {
        setPacked((prev) => prev.slice(0, prev.length - inCrate));
        crateRef.current = 0;
        setInCrate(0);
        sfx.release();
        closingRef.current = false;
      }, 600);
      return;
    }
    sfx.groupPulse();
    schedule(() => setStep("tens"), 500);
  }, [step, remaining, inCrate, schedule]);

  const frameRef = useRef<ComponentRef<typeof View>>(null);
  const dropOnCrate = (slot: number, x: number, y: number) => {
    frameRef.current?.measureInWindow((fx, fy, fw, fh) => {
      if (inside(x, y, fx, fy, fw, fh)) pack(slot);
    });
  };

  const autoFill = () => {
    if (step !== "pack" || waiting || closingRef.current) return;
    if (!handFilled) {
      sfx.nudge();
      return;
    }
    const need = 10 - inCrate;
    const next = Array.from({ length: a }, (_, i) => i)
      .filter((i) => !packed.includes(i))
      .slice(0, need);
    if (next.length < need) return;
    next.forEach((slot, k) => schedule(() => pack(slot), k * AUTO_STEP_MS));
  };

  const looseKeys = () =>
    Array.from({ length: a }, (_, i) => i)
      .filter((i) => !packed.includes(i))
      .map((i) => `o${i}`);

  const countAloud = (what: "tens" | "ones") => {
    const keys =
      what === "tens"
        ? Array.from({ length: shelf }, (_, i) => `t${i}`)
        : looseKeys();
    setBubbles((prev) => {
      const next = { ...prev };
      keys.forEach((k, i) => {
        next[k] = {
          label: i + 1,
          delayMs: i * COUNT_STEP_MS,
          n: (prev[k]?.n ?? 0) + 1,
        };
      });
      return next;
    });
    keys.forEach((_, i) => schedule(() => sfx.snap(i), i * COUNT_STEP_MS));
    return keys.length * COUNT_STEP_MS;
  };

  const finish = () => {
    doneRef.current = true;
    setStep("solved");
    schedule(() => sfx.solved(), 300);
    schedule(onSolved, SOLVED_HANDOFF_MS);
  };

  const answer = (n: number) => {
    if (doneRef.current || (step !== "tens" && step !== "ones")) return;
    const target = step === "tens" ? tensAnswer : onesAnswer;
    const correct = n === target;
    onAttempt?.({ target, answer: n, correct });
    if (!correct) {
      setMisses((m) => m + 1);
      sfx.nudge();
      schedule(onStruggle, countAloud(step));
      return;
    }
    sfx.groupPulse();
    if (step === "tens") setStep("ones");
    else finish();
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) =>
      sameSize(prev, width, height) ? prev : { w: width, h: height },
    );
  };
  const crateCell = size ? Math.floor(Math.min(36, (size.w - 60) / 6)) : 30;
  const grid = useMemo(() => gridFor(size, a, crateCell), [size, a, crateCell]);
  const itemSize = grid.pitch - 4;

  const prompt = promptFor(step, handFilled, tensAnswer, onesAnswer, a);
  const promptClip = clipFor(step, handFilled);
  const asking = step === "tens" || step === "ones";

  const testID = `g2-pack-l${level ?? 0}-${a}`;
  if (!size)
    return <View style={styles.root} onLayout={onLayout} testID={testID} />;

  return (
    <View style={styles.root} onLayout={onLayout} testID={testID}>
      <PlaceValueChart
        total={a}
        places={["tens", "ones"]}
        digits={{
          tens: step === "ones" || step === "solved" ? tensAnswer : undefined,
          ones: step === "solved" ? onesAnswer : undefined,
        }}
        solved={step === "solved"}
      />

      <Prompt
        text={prompt.replaceAll("tomato", itemWord(item))}
        clipId={promptClip}
        waiting={waiting}
        silent={step === "solved"}
      />

      <View
        style={[styles.shelf, step === "tens" ? styles.focus : null]}
        accessible
        accessibilityLabel={`${shelf} full crates`}
      >
        <View style={styles.shelfCrates}>
          {Array.from({ length: shelf }, (_, i) => (
            <Animated.View key={i} entering={POP}>
              <Crate item={item} cell={9} bubble={bubbles[`t${i}`]} />
            </Animated.View>
          ))}
        </View>
      </View>

      {step === "pack" ? (
        <View ref={frameRef} collapsable={false}>
          <PackCrate
            item={item}
            cell={crateCell}
            inCrate={inCrate}
            handFilled={handFilled}
            glow={handFilled || !!palActive}
            onPress={autoFill}
          />
        </View>
      ) : null}

      <View style={[styles.table, step === "ones" ? styles.focus : null]}>
        {step !== "pack" ? (
          <Text style={partStyles.head}>Left over</Text>
        ) : null}
        <View style={[styles.loose, { width: grid.cols * grid.pitch }]}>
          {Array.from({ length: a }, (_, slot) => (
            <LooseSlot
              key={`slot-${slot}`}
              item={item}
              pitch={grid.pitch}
              size={itemSize}
              packed={packed.includes(slot)}
              packing={step === "pack"}
              bubble={bubbles[`o${slot}`]}
              onTap={() => pack(slot)}
              onDrop={(x, y) => dropOnCrate(slot, x, y)}
            />
          ))}
        </View>
      </View>

      {asking ? (
        <Choices
          key={step}
          unit={step}
          target={step === "tens" ? tensAnswer : onesAnswer}
          onPick={answer}
        />
      ) : null}
    </View>
  );
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 12,
  },
  shelf: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "stretch",
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.atCream,
    borderWidth: 2,
    borderColor: colors.atMintDeep,
  },
  shelfCrates: { flexDirection: "row", flexWrap: "wrap", gap: 6, flex: 1 },
  table: {
    alignItems: "center",
    gap: 4,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 4,
  },
  focus: {
    borderColor: colors.atYellow,
    backgroundColor: "rgba(255,229,138,0.25)",
  },
  loose: { flexDirection: "row", flexWrap: "wrap" },
});
