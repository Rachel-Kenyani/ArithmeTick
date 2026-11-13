import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, { FadeIn } from "react-native-reanimated";
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Text as SvgText } from "react-native-svg";
import { scheduleOnRN } from "react-native-worklets";

import { CHAPATI_EDGE, ChapatiBody } from "@/components/illustrations/ChapatiArt";
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
const COUNT_HOLD_MS = 1400;
const CUTS: readonly Cut[] = ["down", "across"];
const QUARTERS = [
  { id: "top-right", dx: 1, dy: -1, from: -90, to: 0 },
  { id: "bottom-right", dx: 1, dy: 1, from: 0, to: 90 },
  { id: "bottom-left", dx: -1, dy: 1, from: 90, to: 180 },
  { id: "top-left", dx: -1, dy: -1, from: 180, to: 270 },
] as const;

export function fractionChoices(parts: number): { top: number; bottom: number }[] {
  const near = [2, 3, 4, 8].filter((b) => b !== parts).slice(0, 2);
  return [parts, ...near].sort((x, y) => x - y).map((bottom) => ({ top: 1, bottom }));
}

export function chapatiPrompt(step: Step, parts: number): string {
  return {
    cut: "Cut the chapati into 4 equal pieces. Slide your finger along each dashed line.",
    give: "Tap 1 piece to give to Brijo.",
    name: "Brijo has 1 of 4 equal pieces. What fraction of the chapati is that?",
    solved: `1 out of ${parts} equal pieces is 1 quarter!`,
  }[step];
}

interface Stroke {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function strokeCut({ x1, y1, x2, y2 }: Stroke, r: number): Cut | null {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const near = r * 0.45;
  if (Math.abs(dy) >= r * 0.9 && Math.abs(dx) <= Math.abs(dy) * 0.6 && Math.abs((x1 + x2) / 2) <= near) return "down";
  if (Math.abs(dx) >= r * 0.9 && Math.abs(dy) <= Math.abs(dx) * 0.6 && Math.abs((y1 + y2) / 2) <= near) return "across";
  return null;
}

function edges(r: number, from: number, to: number): string {
  const rad = (d: number) => (d * Math.PI) / 180;
  return `M${r * Math.cos(rad(from))} ${r * Math.sin(rad(from))}L0 0L${r * Math.cos(rad(to))} ${r * Math.sin(rad(to))}`;
}

function wedge(r: number, from: number, to: number): string {
  const rad = (d: number) => (d * Math.PI) / 180;
  const x1 = r * Math.cos(rad(from));
  const y1 = r * Math.sin(rad(from));
  const x2 = r * Math.cos(rad(to));
  const y2 = r * Math.sin(rad(to));
  return `M0 0L${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}Z`;
}

export default function Grade3Chapati({ level = 0, parts, waiting = false, onStruggle, onAttempt, onSolved, draft, onDraft }: Readonly<FractionProps>) {
  const schedule = useScheduler();
  const [cuts, setCuts] = useState<Cut[]>([]);
  const [given, setGiven] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("cut");
  const [counted, setCounted] = useState(0);
  const [trail, setTrail] = useState<Stroke | null>(null);
  const trailRef = useRef<Stroke | null>(null);
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
    QUARTERS.forEach((_, i) => {
      schedule(() => {
        sfx.snap(i);
        narration.number(i + 1);
        setCounted(i + 1);
      }, (i + 1) * COUNT_STEP_MS);
    });
    const end = QUARTERS.length * COUNT_STEP_MS + COUNT_HOLD_MS;
    schedule(() => setCounted(0), end);
    return end;
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
  const half = box / 2;

  const drawStroke = (stroke: Stroke) => {
    trailRef.current = stroke;
    setTrail(stroke);
  };
  const endStroke = () => {
    const stroke = trailRef.current;
    trailRef.current = null;
    setTrail(null);
    const line = stroke ? strokeCut(stroke, r) : null;
    if (line) cut(line);
  };
  const slice = usePanGesture({
    enabled: step === "cut" && !waiting,
    maxPointers: 1,
    minDistance: 8,
    onUpdate: (e) => {
      scheduleOnRN(drawStroke, { x1: e.x - e.translationX - half, y1: e.y - e.translationY - half, x2: e.x - half, y2: e.y - half });
    },
    onFinalize: () => {
      scheduleOnRN(endStroke);
    },
  });
  const gapOut = cuts.length === CUTS.length ? box * 0.035 : 0;
  const tag = `g3-l${String(level).padStart(2, "0")}`;
  const clip = { cut: `${tag}-cut`, give: `${tag}-give`, name: `${tag}-name`, solved: "" }[step];

  return (
    <View style={styles.root} testID={`g3-chapati-l${level}-${parts}`}>
      <Prompt text={chapatiPrompt(step, parts)} clipId={clip} waiting={waiting} silent={step === "solved"} />

      <View style={styles.stage} onLayout={onLayout}>
        {size ? (
          <GestureDetector gesture={slice}>
            <View style={{ width: box, height: box }} accessibilityLabel={`Chapati, ${cuts.length === CUTS.length ? "cut into 4 equal pieces" : "not cut yet"}`}>
              <Svg width={box} height={box} viewBox={`${-box / 2} ${-box / 2} ${box} ${box}`}>
                {cuts.length < CUTS.length ? (
                  <ChapatiBody r={r} id="whole" />
                ) : (
                  QUARTERS.map((q, i) => {
                    const away = given === q.id ? box * 0.09 : gapOut;
                    const number = i < counted ? i + 1 : null;
                    const lit = number !== null || given === q.id;
                    const mid = (((q.from + q.to) / 2) * Math.PI) / 180;
                    const nx = Math.cos(mid) * r * 0.55;
                    const ny = Math.sin(mid) * r * 0.55;
                    return (
                      <G key={q.id} transform={`translate(${q.dx * away} ${q.dy * away})`}>
                        <Defs>
                          <ClipPath id={`piece-${q.id}`}>
                            <Path d={wedge(r * 1.1, q.from, q.to)} />
                          </ClipPath>
                        </Defs>
                        <G clipPath={`url(#piece-${q.id})`}>
                          <ChapatiBody r={r} id={q.id} />
                        </G>
                        <Path d={edges(r * 1.02, q.from, q.to)} fill="none" stroke={CHAPATI_EDGE} strokeWidth={2} strokeLinejoin="round" />
                        {lit ? <Path d={wedge(r * 1.04, q.from, q.to)} fill="none" stroke={colors.atPurple} strokeWidth={4} strokeLinejoin="round" /> : null}
                        {number === null ? null : (
                          <>
                            <Circle cx={nx} cy={ny} r={r * 0.2} fill={colors.white} stroke={colors.atPurple} strokeWidth={3} />
                            <SvgText x={nx} y={ny + r * 0.085} fontSize={r * 0.24} fontWeight="bold" fill={colors.atInk} textAnchor="middle">
                              {number}
                            </SvgText>
                          </>
                        )}
                      </G>
                    );
                  })
                )}
                {cuts.includes("down") && cuts.length < CUTS.length ? <Line x1={0} y1={-r - 6} x2={0} y2={r + 6} stroke={colors.atInk} strokeWidth={3} /> : null}
                {cuts.includes("across") && cuts.length < CUTS.length ? <Line x1={-r - 6} y1={0} x2={r + 6} y2={0} stroke={colors.atInk} strokeWidth={3} /> : null}
                {step === "cut" && !cuts.includes("down") ? <Line x1={0} y1={-r - 10} x2={0} y2={r + 10} stroke={colors.atPurple} strokeWidth={3} strokeDasharray="8 7" /> : null}
                {step === "cut" && !cuts.includes("across") ? <Line x1={-r - 10} y1={0} x2={r + 10} y2={0} stroke={colors.atPurple} strokeWidth={3} strokeDasharray="8 7" /> : null}
                {trail && step === "cut" ? <Line {...trail} stroke={colors.atInk} strokeWidth={4} strokeLinecap="round" opacity={0.5} /> : null}
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
          </GestureDetector>
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
