/**
 * Grade 2, "Make 34" (KICD Grade 2, 1.1 place value): fill ten-crates, then name the tens and ones.
 *   1. Tap or drag a loose item and it lands on the crate (the Grade 1 white ten-crate).
 *   2. A full crate moves up to the "Full crates" shelf. After the first one is filled by hand, tapping an
 *      empty crate fills it by itself, counting 1 to 10.
 *   3. When fewer than ten are left they can't fill a crate: they are left over. The child answers "how many
 *      full crates?" and "how many left over?", and only then the equation names them: 34 = 3 tens + 4 ones.
 * The instructions never say "tens" or "ones" before the child has seen them: the words arrive with the answer.
 * Feedback (no error text): a wrong answer counts the crates aloud (1, 2, 3); a wrong ones answer
 * counts the loose ones.
 */

import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  FadeIn,
  ReduceMotion,
  ZoomIn,
} from "react-native-reanimated";

import type { CounterItem } from "@/features/play/components/CounterFace";
import { sfx } from "@/services/audio";
import type { GradeModuleProps } from "@/types/domain";
import { colors } from "@/theme";

import { COUNT_STEP_MS } from "../ten-frame/constants";
import { useScheduler } from "../ten-frame/hooks/useScheduler";
import { DragItem } from "./DragItem";
import {
  Crate,
  Equation,
  Loose,
  Prompt,
  TARGET,
  partStyles,
  type Bubble,
} from "./parts";

type Step = "pack" | "tens" | "ones" | "solved";

const DRAFT_VERSION = 1;
const CLOSE_MS = 450;
const AUTO_STEP_MS = 160;
const SOLVED_HANDOFF_MS = 1400;
const POP = ZoomIn.springify()
  .stiffness(380)
  .damping(20)
  .reduceMotion(ReduceMotion.System);

/** Three answer tiles around `n` (never below 0). */
const around = (n: number) => [
  ...new Set([n - 1, n, n + 1].filter((x) => x >= 0)),
];

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

  /** Loose items still on the table, by grid position (packed ones leave their spot empty). */
  const [packed, setPacked] = useState<number[]>([]);
  /** Items on the open crate (0–10). */
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
  /** Items on the open crate, kept in step with `inCrate` for the rising note during an auto-fill. */
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

  // A full crate goes up to the shelf of full crates.
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

  // Too few left to fill the open crate: they go back to the table, and packing is over.
  useEffect(() => {
    if (step !== "pack" || closingRef.current) return;
    if (remaining + inCrate >= 10) return;
    if (inCrate > 0) {
      // A short beat first, so the child sees the crate can't be filled before they hop back.
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

  /** A dragged item counts when it is let go over the crate (with a little give around its edge). */
  const frameRef = useRef<ComponentRef<typeof View>>(null);
  const dropOnCrate = (slot: number, x: number, y: number) => {
    frameRef.current?.measureInWindow((fx, fy, fw, fh) => {
      const give = 24;
      if (
        x >= fx - give &&
        x <= fx + fw + give &&
        y >= fy - give &&
        y <= fy + fh + give
      )
        pack(slot);
    });
  };

  /** Tap the open crate (after the first one is filled by hand): it fills itself, counting up. */
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

  /** Count aloud, one by one: the full crates (1, 2, 3) or the ones left over (1, 2, 3, 4). */
  const countAloud = (what: "tens" | "ones") => {
    const keys =
      what === "tens"
        ? Array.from({ length: shelf }, (_, i) => `t${i}`)
        : Array.from({ length: a }, (_, i) => i)
            .filter((i) => !packed.includes(i))
            .map((i) => `o${i}`);
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
    if (step === "tens") {
      setStep("ones");
      return;
    }
    doneRef.current = true;
    setStep("solved");
    schedule(() => sfx.solved(), 300);
    schedule(onSolved, SOLVED_HANDOFF_MS);
  };

  /* ---- layout ---- */
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) =>
      prev && Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1
        ? prev
        : { w: width, h: height },
    );
  };
  const crateCell = size ? Math.floor(Math.min(36, (size.w - 60) / 6)) : 30;
  // Loose items: the most columns that keep each one near the 48 px touch size and fit the height left.
  const grid = useMemo(() => {
    if (!size) return { cols: 7, pitch: 44 };
    const avail = size.h - 58 - 44 - 46 - (crateCell * 2 + 24) - 40 - 40;
    let best = { cols: 7, pitch: 0 };
    for (let cols = 5; cols <= 8; cols++) {
      const rows = Math.ceil(a / cols);
      const pitch = Math.min(56, (size.w - 24) / cols, avail / rows);
      if (pitch > best.pitch) best = { cols, pitch };
    }
    return { cols: best.cols, pitch: Math.floor(best.pitch) };
  }, [size, a, crateCell]);
  const itemSize = grid.pitch - 4;

  const prompt =
    step === "pack"
      ? handFilled
        ? "A full crate holds 10. Tap the empty crate to fill it!"
        : "Tap or drag a tomato to put it on the crate"
      : step === "tens"
        ? "How many full ten crates are there?"
        : step === "ones"
          ? "How many tomatoes are left over?"
          : `${tensAnswer} full crates and ${onesAnswer} left over make ${a}!`;
  const promptClip = step === "pack" ? (handFilled ? "pv-fill" : "pv-pack") : step === "tens" ? "pv-crates" : "pv-leftover";

  return (
    <View
      style={styles.root}
      onLayout={onLayout}
      testID={`g2-pack-l${level ?? 0}-${a}`}
    >
      {size ? (
        <>
          <Equation
            op="build"
            a={a}
            b={0}
            answer={a}
            solved={step === "solved"}
            tens={step === "ones" || step === "solved" ? tensAnswer : undefined}
            ones={step === "solved" ? onesAnswer : undefined}
          />

          <Prompt text={prompt.replaceAll("tomato", itemWord(item))} clipId={promptClip} waiting={waiting} silent={step === "solved"} />

          {/* Full crates: each is one ten */}
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
              <Pressable
                onPress={autoFill}
                accessibilityRole="button"
                accessibilityLabel={`Crate, ${inCrate} of 10${handFilled ? ". Tap to fill it" : ""}`}
                style={({ pressed }) => [
                  pressed && handFilled ? styles.pressed : null,
                ]}
              >
                <Crate
                  item={item}
                  cell={crateCell}
                  filled={inCrate}
                  glow={handFilled || palActive}
                  countLast
                />
              </Pressable>
            </View>
          ) : null}

          {/* The table: loose items to pack; what's left is the ones */}
          <View style={[styles.table, step === "ones" ? styles.focus : null]}>
            {step !== "pack" ? (
              <Text style={partStyles.head}>Left over</Text>
            ) : null}
            <View style={[styles.loose, { width: grid.cols * grid.pitch }]}>
              {Array.from({ length: a }, (_, slot) => (
                <View
                  key={slot}
                  style={{
                    width: grid.pitch,
                    height: grid.pitch,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {packed.includes(slot) ? null : (
                    <DragItem
                      enabled={step === "pack"}
                      onTap={() => pack(slot)}
                      onDrop={(x, y) => dropOnCrate(slot, x, y)}
                      hitSlop={Math.max(
                        0,
                        Math.ceil((TARGET - grid.pitch) / 2),
                      )}
                      label={
                        step === "pack"
                          ? `${itemWord(item)}. Tap or drag it onto the crate`
                          : itemWord(item)
                      }
                    >
                      <Loose
                        item={item}
                        size={itemSize}
                        bubble={bubbles[`o${slot}`]}
                      />
                    </DragItem>
                  )}
                </View>
              ))}
            </View>
          </View>

          {step === "tens" || step === "ones" ? (
            <Animated.View
              key={step}
              entering={FadeIn.duration(220)}
              style={partStyles.choices}
            >
              {around(step === "tens" ? tensAnswer : onesAnswer).map((n) => (
                <Pressable
                  key={n}
                  onPress={() => answer(n)}
                  accessibilityRole="button"
                  accessibilityLabel={`${n} ${step}`}
                  style={partStyles.choice}
                >
                  <Text style={partStyles.choiceText}>{n}</Text>
                </Pressable>
              ))}
            </Animated.View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const itemWord = (item: CounterItem) => (item === "cap" ? "bottle top" : item);

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
  pressed: { transform: [{ scale: 0.97 }] },
});
