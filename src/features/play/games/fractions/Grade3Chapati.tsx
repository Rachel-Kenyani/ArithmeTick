import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import Svg, { Circle, G, Line, Path } from "react-native-svg";

import { sfx } from "@/services/audio";
import { narration } from "@/services/narration";
import type { FractionProps } from "@/types/domain";
import { colors, fonts } from "@/theme";

import { Prompt, TARGET, partStyles } from "../place-value/parts";
import { COUNT_STEP_MS } from "../ten-frame/constants";
import { useScheduler } from "../ten-frame/hooks/useScheduler";

type Step = "cut" | "give" | "name" | "solved";
type Cut = "down" | "across";

const DRAFT_VERSION = 1;
const SOLVED_HANDOFF_MS = 1600;
const CUTS: readonly Cut[] = ["down", "across"];
const DOUGH = "#f2d29b";
const SPOT = "#c98b4e";
/** Brown spots on the chapati, as fractions of its radius, so it looks cooked. */
const SPOTS = [
  { id: "s1", x: -0.45, y: -0.3, r: 0.07 },
  { id: "s2", x: 0.35, y: -0.5, r: 0.05 },
  { id: "s3", x: 0.5, y: 0.25, r: 0.08 },
  { id: "s4", x: -0.25, y: 0.5, r: 0.06 },
  { id: "s5", x: 0.05, y: -0.1, r: 0.05 },
  { id: "s6", x: -0.6, y: 0.15, r: 0.04 },
] as const;

/** Each quarter, by the corner it sits in, with which way it moves out once cut. */
const QUARTERS = [
  { id: "top-right", dx: 1, dy: -1, from: -90, to: 0 },
  { id: "bottom-right", dx: 1, dy: 1, from: 0, to: 90 },
  { id: "bottom-left", dx: -1, dy: 1, from: 90, to: 180 },
  { id: "top-left", dx: -1, dy: -1, from: 180, to: 270 },
] as const;

/** The fractions offered as answers: the right one and the two children most often mix it up with. */
export function fractionChoices(parts: number): { top: number; bottom: number }[] {
  const near = [2, 3, 4, 8].filter((b) => b !== parts).slice(0, 2);
  return [parts, ...near].sort((x, y) => x - y).map((bottom) => ({ top: 1, bottom }));
}

export function chapatiPrompt(step: Step, parts: number): string {
  return {
    cut: "Cut the chapati into 4 equal pieces. Tap each dashed line to cut.",
    give: "Tap 1 piece to give to Brijo.",
    name: "Brijo has 1 of 4 equal pieces. What fraction of the chapati is that?",
    solved: `1 out of ${parts} equal pieces is 1 quarter!`,
  }[step];
}

function wedge(r: number, from: number, to: number): string {
  const rad = (d: number) => (d * Math.PI) / 180;
  const x1 = r * Math.cos(rad(from));
  const y1 = r * Math.sin(rad(from));
  const x2 = r * Math.cos(rad(to));
  const y2 = r * Math.sin(rad(to));
  return `M0 0L${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}Z`;
}

/**
 * Fractions as fair shares of a chapati: the child cuts it into 4 equal pieces, gives Brijo one, and names the
 * fraction. A wrong name has Brijo count the pieces aloud, pointing at each.
 */
export default function Grade3Chapati({ level = 0, parts, waiting = false, onStruggle, onAttempt, onSolved, draft, onDraft }: Readonly<FractionProps>) {
  const schedule = useScheduler();
  const [cuts, setCuts] = useState<Cut[]>([]);
  const [given, setGiven] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("cut");
  const [counting, setCounting] = useState<string | null>(null);
  const [misses, setMisses] = useState(draft?.version === DRAFT_VERSION ? draft.misses : 0);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    onDraft?.({ version: DRAFT_VERSION, misses });
  }, [onDraft, misses]);

  const cut = (line: Cut) => {
    if (step !== "cut" || waiting || cuts.includes(line)) return;
    sfx.bundle();
    const now = [...cuts, line];
    setCuts(now);
    if (now.length === CUTS.length) schedule(() => setStep("give"), 600);
  };

  const give = (id: string) => {
    if (step !== "give" || waiting) return;
    sfx.snap(0);
    setGiven(id);
    schedule(() => setStep("name"), 700);
  };

  const countPieces = () => {
    QUARTERS.forEach((q, i) => {
      schedule(() => {
        sfx.snap(i);
        narration.number(i + 1);
        setCounting(q.id);
      }, (i + 1) * COUNT_STEP_MS);
    });
    schedule(() => setCounting(null), (QUARTERS.length + 1) * COUNT_STEP_MS);
    return (QUARTERS.length + 1) * COUNT_STEP_MS;
  };

  const pick = (bottom: number) => {
    if (step !== "name" || doneRef.current || waiting) return;
    const correct = bottom === parts;
    onAttempt?.({ target: parts, answer: bottom, correct });
    if (!correct) {
      setMisses((m) => m + 1);
      sfx.nudge();
      schedule(onStruggle, countPieces());
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

  const box = size ? Math.max(180, Math.min(size.w - 40, size.h - 40)) : 0;
  const r = box * 0.38;
  const gapOut = cuts.length === CUTS.length ? box * 0.035 : 0;
  const tag = `g3-l${String(level).padStart(2, "0")}`;
  const clip = { cut: `${tag}-cut`, give: `${tag}-give`, name: `${tag}-name`, solved: "" }[step];

  return (
    <View style={styles.root} testID={`g3-chapati-l${level}-${parts}`}>
      <Prompt text={chapatiPrompt(step, parts)} clipId={clip} waiting={waiting} silent={step === "solved"} />

      <View style={styles.stage} onLayout={onLayout}>
        {size ? (
          <View style={{ width: box, height: box }} accessibilityLabel={`Chapati, ${cuts.length === CUTS.length ? "cut into 4 equal pieces" : "not cut yet"}`}>
            <Svg width={box} height={box} viewBox={`${-box / 2} ${-box / 2} ${box} ${box}`}>
              {cuts.length < CUTS.length ? (
                <Chapati r={r} />
              ) : (
                QUARTERS.map((q) => {
                  const away = given === q.id ? box * 0.09 : gapOut;
                  const lit = counting === q.id || given === q.id;
                  return (
                    <G key={q.id} transform={`translate(${q.dx * away} ${q.dy * away})`}>
                      <Path d={wedge(r, q.from, q.to)} fill={DOUGH} stroke={lit ? colors.atPurple : "#a8743f"} strokeWidth={lit ? 4 : 2} />
                    </G>
                  );
                })
              )}
              {cuts.includes("down") && cuts.length < CUTS.length ? <Line x1={0} y1={-r - 6} x2={0} y2={r + 6} stroke={colors.atInk} strokeWidth={3} /> : null}
              {cuts.includes("across") && cuts.length < CUTS.length ? <Line x1={-r - 6} y1={0} x2={r + 6} y2={0} stroke={colors.atInk} strokeWidth={3} /> : null}
              {step === "cut" && !cuts.includes("down") ? <Line x1={0} y1={-r - 10} x2={0} y2={r + 10} stroke={colors.atPurple} strokeWidth={3} strokeDasharray="8 7" /> : null}
              {step === "cut" && !cuts.includes("across") ? <Line x1={-r - 10} y1={0} x2={r + 10} y2={0} stroke={colors.atPurple} strokeWidth={3} strokeDasharray="8 7" /> : null}
            </Svg>

            {step === "cut" && !cuts.includes("down") ? (
              <Pressable onPress={() => cut("down")} accessibilityRole="button" accessibilityLabel="Cut down the middle" style={[styles.cutHit, { left: box / 2 - TARGET / 2, top: box / 2 - r - 10, width: TARGET, height: (r + 10) * 2 }]} />
            ) : null}
            {step === "cut" && !cuts.includes("across") ? (
              <Pressable onPress={() => cut("across")} accessibilityRole="button" accessibilityLabel="Cut across the middle" style={[styles.cutHit, { top: box / 2 - TARGET / 2, left: box / 2 - r - 10, height: TARGET, width: (r + 10) * 2 }]} />
            ) : null}
            {step === "give"
              ? QUARTERS.map((q) => (
                  <Pressable
                    key={`hit-${q.id}`}
                    onPress={() => give(q.id)}
                    accessibilityRole="button"
                    accessibilityLabel="Piece of chapati. Tap to give it to Brijo"
                    style={[styles.cutHit, { left: box / 2 + (q.dx > 0 ? 6 : -r * 0.95), top: box / 2 + (q.dy > 0 ? 6 : -r * 0.95), width: r * 0.9, height: r * 0.9 }]}
                  />
                ))
              : null}
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        {step === "name" ? (
          <Animated.View entering={FadeIn.duration(220)} style={partStyles.choices}>
            {fractionChoices(parts).map((f) => (
              <Pressable key={`1-${f.bottom}`} onPress={() => pick(f.bottom)} accessibilityRole="button" accessibilityLabel={`1 over ${f.bottom}`} style={[partStyles.choice, styles.fraction]}>
                <Text style={styles.fracNum}>{f.top}</Text>
                <View style={styles.fracBar} />
                <Text style={styles.fracNum}>{f.bottom}</Text>
              </Pressable>
            ))}
          </Animated.View>
        ) : null}
        {step === "solved" ? (
          <Animated.View entering={FadeIn.duration(220)} style={[partStyles.choice, styles.fraction, styles.fractionWin]}>
            <Text style={styles.fracNum}>1</Text>
            <View style={styles.fracBar} />
            <Text style={styles.fracNum}>{parts}</Text>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

function Chapati({ r }: Readonly<{ r: number }>) {
  return (
    <>
      <Circle cx={0} cy={0} r={r} fill={DOUGH} stroke="#a8743f" strokeWidth={2} />
      {SPOTS.map((s) => (
        <Circle key={s.id} cx={s.x * r} cy={s.y * r} r={s.r * r} fill={SPOT} opacity={0.55} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 10 },
  stage: { flex: 1, alignSelf: "stretch", alignItems: "center", justifyContent: "center" },
  cutHit: { position: "absolute" },
  actions: { minHeight: 84, alignItems: "center", justifyContent: "center" },
  fraction: { minWidth: 64, paddingVertical: 6, gap: 2 },
  fractionWin: { borderColor: "#E0A800", backgroundColor: colors.atCream },
  fracNum: { fontFamily: fonts.bodyBold, fontSize: 24, lineHeight: 28, color: colors.atTeal },
  fracBar: { alignSelf: "stretch", height: 3, marginHorizontal: 8, borderRadius: 2, backgroundColor: colors.atTeal },
});
