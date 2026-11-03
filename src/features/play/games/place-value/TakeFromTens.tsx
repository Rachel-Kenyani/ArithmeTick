import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { FadeIn, ReduceMotion, ZoomIn, ZoomOut } from "react-native-reanimated";

import BasketArt from "@/components/illustrations/BasketArt";
import type { CounterItem } from "@/features/play/components/CounterFace";
import { sfx } from "@/services/audio";
import { narration } from "@/services/narration";
import type { PlaceValueProps } from "@/types/domain";
import { colors } from "@/theme";

import { CountBubble } from "../ten-frame/components/CountBubble";
import { COUNT_STEP_MS } from "../ten-frame/constants";
import { useScheduler } from "../ten-frame/hooks/useScheduler";
import { Crate, Equation, Loose, Prompt, TARGET, partStyles, type Bubble } from "./parts";

type Step = "giveCrates" | "open" | "giveOnes" | "tens" | "ones" | "solved";

const DRAFT_VERSION = 1;
const SOLVED_HANDOFF_MS = 1400;
const SHORT_COUNT_MS = 1200;
const QUIET_FALLBACK_MS = 2500;
const POP = ZoomIn.springify().stiffness(380).damping(20).reduceMotion(ReduceMotion.System);
const OUT = ZoomOut.duration(200).reduceMotion(ReduceMotion.System);

const around = (n: number) => [...new Set([n - 1, n, n + 1].filter((x) => x >= 0))];

function plural(item: CounterItem, n = 2): string {
  if (item === "cap") return n === 1 ? "bottle top" : "bottle tops";
  if (n === 1) return item;
  return item === "tomato" || item === "mango" ? `${item}es` : `${item}s`;
}

/** The first step: whole tens to give, then a crate to open if the ones run short, then the ones. */
function firstStep(a: number, b: number): Step {
  if (Math.floor(b / 10) > 0) return "giveCrates";
  return a % 10 < b % 10 ? "open" : "giveOnes";
}

export default function TakeFromTens({ level, a, b, item = "orange", waiting = false, onStruggle, onAttempt, onSolved, draft, onDraft }: Readonly<PlaceValueProps>) {
  const schedule = useScheduler();
  const answer = a - b;
  const cratesToGive = Math.floor(b / 10);
  const onesToGive = b % 10;
  const [full, setFull] = useState(Math.floor(a / 10));
  const [loose, setLoose] = useState(a % 10);
  const [cratesGiven, setCratesGiven] = useState(0);
  const [onesGiven, setOnesGiven] = useState(0);
  const [step, setStep] = useState<Step>(() => firstStep(a, b));
  const [misses, setMisses] = useState(draft?.version === DRAFT_VERSION ? draft.misses : 0);
  const [bubbles, setBubbles] = useState<Partial<Record<string, Bubble>>>({});
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [shortCounted, setShortCounted] = useState(false);
  const bubbleN = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    onDraft?.({ version: DRAFT_VERSION, misses });
  }, [onDraft, misses]);

  useEffect(() => {
    if (step !== "open" || waiting || shortCounted) return;
    let heard = false;
    let started = false;
    const countShort = () => {
      if (started) return;
      started = true;
      setBubbles((prev) => {
        const next = { ...prev };
        Array.from({ length: loose }, (_, i) => {
          bubbleN.current += 1;
          next[`loose-${i}`] = { label: i + 1, delayMs: i * SHORT_COUNT_MS, n: bubbleN.current };
          return i;
        });
        return next;
      });
      Array.from({ length: loose }, (_, i) => schedule(() => narration.number(i + 1), i * SHORT_COUNT_MS));
      schedule(() => setShortCounted(true), loose * SHORT_COUNT_MS);
    };
    const unsubscribe = narration.subscribe((range) => {
      if (range) {
        heard = true;
      } else if (heard) {
        countShort();
      }
    });
    const fallback = setTimeout(() => {
      if (!heard) countShort();
    }, QUIET_FALLBACK_MS);
    return () => {
      unsubscribe();
      clearTimeout(fallback);
    };
  }, [step, waiting, shortCounted, loose, schedule]);

  const afterCrates = () => setStep(loose < onesToGive ? "open" : "giveOnes");

  const giveCrate = () => {
    if (step !== "giveCrates" || waiting) return;
    sfx.pickup();
    const now = cratesGiven + 1;
    setCratesGiven(now);
    setFull((f) => f - 1);
    if (now === cratesToGive) schedule(afterCrates, 500);
  };

  const openCrate = () => {
    if (step !== "open" || waiting || !shortCounted) return;
    sfx.bundle();
    setFull((f) => f - 1);
    setLoose((l) => l + 10);
    schedule(() => setStep("giveOnes"), 500);
  };

  const giveOne = () => {
    if (step !== "giveOnes" || waiting || loose === 0) return;
    sfx.snap(onesGiven);
    const now = onesGiven + 1;
    setOnesGiven(now);
    setLoose((l) => l - 1);
    if (now === onesToGive) {
      sfx.groupPulse();
      schedule(() => setStep("tens"), 700);
    }
  };

  const countAloud = (what: "tens" | "ones") => {
    const keys = what === "tens" ? Array.from({ length: full }, (_, i) => `full-${i}`) : Array.from({ length: loose }, (_, i) => `loose-${i}`);
    setBubbles((prev) => {
      const next = { ...prev };
      keys.forEach((k, i) => {
        bubbleN.current += 1;
        next[k] = { label: i + 1, delayMs: i * COUNT_STEP_MS, n: bubbleN.current };
      });
      return next;
    });
    keys.forEach((_, i) => schedule(() => sfx.snap(i), i * COUNT_STEP_MS));
    return keys.length * COUNT_STEP_MS;
  };

  const pick = (n: number) => {
    if (doneRef.current || (step !== "tens" && step !== "ones")) return;
    const target = step === "tens" ? full : loose;
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

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev && Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1 ? prev : { w: width, h: height }));
  };
  const cell = size ? Math.floor(Math.max(TARGET - 4, Math.min(52, (size.w - 40) / 5 - 6, (size.h - 380) / 3))) : 44;
  const many = plural(item);
  const id = `g2-l${String(level ?? 0).padStart(2, "0")}`;

  const prompt = {
    giveCrates: `Give Brijo ${cratesToGive === 1 ? "1 full crate" : `${cratesToGive} full crates`}. Tap a full crate.`,
    open: `Brijo needs ${onesToGive} ${many}. There ${loose === 1 ? "is" : "are"} only ${loose} left over. Open a full crate!`,
    giveOnes: `Tap ${onesToGive} ${plural(item, onesToGive)} to give to Brijo.`,
    tens: "How many full crates are left?",
    ones: `How many ${many} are left over?`,
    solved: `${full} full crates and ${loose} left over make ${answer}!`,
  }[step];
  const clip = { giveCrates: `${id}-crates`, open: `${id}-open`, giveOnes: `${id}-give`, tens: "pv-crates-left", ones: `${id}-leftover`, solved: "" }[step];
  const cratesTappable = step === "giveCrates" || (step === "open" && shortCounted);

  return (
    <View style={styles.root} onLayout={onLayout} testID={`g2-takefromtens-l${level ?? 0}-${a}-${b}`}>
      {size ? (
        <>
          <Equation op="sub" a={a} b={b} answer={answer} solved={step === "solved"} />
          <Prompt text={prompt} clipId={clip} waiting={waiting} silent={step === "solved"} />

          <View style={styles.basket} accessible accessibilityLabel={`${cratesGiven * 10 + onesGiven} in Brijo's basket`}>
            <View style={styles.basketArt}>
              <BasketArt />
            </View>
            <View style={styles.basketItems}>
              {Array.from({ length: cratesGiven }, (_, i) => (
                <Animated.View key={`bc-${i}`} entering={POP}>
                  <Crate item={item} cell={6} />
                </Animated.View>
              ))}
              {Array.from({ length: onesGiven }, (_, i) => (
                <Animated.View key={`bo-${i}`} entering={POP}>
                  <View>
                    <Loose item={item} size={22} />
                    <CountBubble key={`b-${i}`} label={i + 1} delayMs={0} size={22} />
                  </View>
                </Animated.View>
              ))}
            </View>
          </View>

          <View style={[styles.shelf, step === "tens" ? styles.focus : null]}>
            <Text style={partStyles.head}>{"Full\ncrates"}</Text>
            <View style={styles.shelfCrates}>
              {Array.from({ length: full }, (_, i) => (
                <Animated.View key={`full-${i}`} entering={POP} exiting={OUT}>
                  <Pressable
                    onPress={step === "open" ? openCrate : giveCrate}
                    disabled={!cratesTappable}
                    hitSlop={8}
                    accessibilityRole={cratesTappable ? "button" : "image"}
                    accessibilityLabel={step === "open" ? "Full crate. Tap to open it" : step === "giveCrates" ? "Full crate. Tap to give it to Brijo" : "Full crate"}
                    style={[styles.crateTap, cratesTappable ? styles.tapOn : null]}
                  >
                    <Crate item={item} cell={9} bubble={bubbles[`full-${i}`]} />
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </View>

          <View style={[styles.table, step === "ones" ? styles.focus : null]}>
            <Text style={partStyles.head}>Left over</Text>
            <View style={[styles.loose, { width: 5 * (cell + 6) }]}>
              {Array.from({ length: loose }, (_, i) => (
                <Animated.View key={`loose-${a}-${i}`} entering={POP} exiting={OUT} style={{ width: cell + 6, height: cell + 6, alignItems: "center", justifyContent: "center" }}>
                  <Pressable
                    onPress={giveOne}
                    disabled={step !== "giveOnes"}
                    hitSlop={Math.max(0, Math.ceil((TARGET - cell) / 2))}
                    accessibilityRole={step === "giveOnes" ? "button" : "image"}
                    accessibilityLabel={step === "giveOnes" ? `${plural(item, 1)}. Tap to give it to Brijo` : plural(item, 1)}
                  >
                    <Loose item={item} size={cell} bubble={bubbles[`loose-${i}`]} />
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            {step === "tens" || step === "ones" ? (
              <Animated.View key={step} entering={FadeIn.duration(220)} style={partStyles.choices}>
                {around(step === "tens" ? full : loose).map((n) => (
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

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 12 },
  basket: { alignItems: "center", minHeight: 84, marginTop: 18, marginBottom: 14 },
  basketArt: { width: 230, height: 84 },
  basketItems: { position: "absolute", top: 6, left: 0, right: 0, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", columnGap: 6, rowGap: 4, paddingHorizontal: 28 },
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
  crateTap: { padding: 4, borderRadius: 10, borderWidth: 2, borderColor: "transparent", minHeight: TARGET, justifyContent: "center" },
  tapOn: { borderColor: colors.atTealLight, borderStyle: "dashed" },
  table: { alignItems: "center", gap: 4, borderRadius: 14, borderWidth: 2, borderColor: "transparent", padding: 4 },
  focus: { borderColor: colors.atYellow, backgroundColor: "rgba(255,229,138,0.25)" },
  loose: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  actions: { minHeight: TARGET, alignItems: "center", justifyContent: "center" },
});
