import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { sfx } from "@/services/audio";
import { narration } from "@/services/narration";
import type { ClockProps } from "@/types/domain";
import { colors, fonts } from "@/theme";

import { Prompt, TARGET } from "../place-value/parts";
import { useScheduler } from "../ten-frame/hooks/useScheduler";

const DRAFT_VERSION = 1;
const SOLVED_HANDOFF_MS = 1800;
const HINT_AFTER = 2;
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const SPRING = { damping: 14, stiffness: 140, reduceMotion: ReduceMotion.System };

const WORDS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

function Hand({ length, width, color, angle }: Readonly<{ length: number; width: number; color: string; angle: number }>) {
  const turn = useSharedValue(angle);
  useEffect(() => {
    turn.set(withSpring(angle, SPRING));
  }, [turn, angle]);
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get()}deg` }] }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.hand, { height: length, width, marginLeft: -width / 2, marginTop: -length, borderRadius: width, backgroundColor: color }, st]}
    />
  );
}

export default function Grade2Clock({ level, hour, waiting = false, onStruggle, onAttempt, onSolved, draft, onDraft }: Readonly<ClockProps>) {
  const schedule = useScheduler();
  const [shown, setShown] = useState(12);
  const [solved, setSolved] = useState(false);
  const [misses, setMisses] = useState(draft?.version === DRAFT_VERSION ? draft.misses : 0);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [angle, setAngle] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    onDraft?.({ version: DRAFT_VERSION, misses });
  }, [onDraft, misses]);

  const pointTo = (n: number) => {
    const target = (n % 12) * 30;
    const current = ((angle % 360) + 360) % 360;
    const step = (target - current + 360) % 360;
    setAngle(angle + step);
    setShown(n);
  };

  const tapHour = (n: number) => {
    if (solved || waiting || doneRef.current) return;
    sfx.snap(n % 8);
    pointTo(n);
    const correct = n === hour;
    onAttempt?.({ target: hour, answer: n, correct });
    if (!correct) {
      setMisses((m) => m + 1);
      sfx.nudge();
      narration.prompt(`That's ${WORDS[n]} o'clock.`, `clock-${n}`);
      schedule(onStruggle, 1600);
      return;
    }
    doneRef.current = true;
    setSolved(true);
    schedule(() => sfx.solved(), 500);
    schedule(onSolved, SOLVED_HANDOFF_MS);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev && Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1 ? prev : { w: width, h: height }));
  };
  const face = size ? Math.floor(Math.max(260, Math.min(340, size.w - 32, size.h - 200))) : 280;
  const r = face / 2;
  const ring = r - TARGET / 2 - 10;
  const hint = misses >= HINT_AFTER && !solved;
  const id = `g2-l${String(level ?? 0).padStart(2, "0")}`;
  const prompt = solved ? `${WORDS[hour]} o'clock!` : `Make it ${WORDS[hour]} o'clock. Tap a number to move the short hand.`;

  return (
    <View style={styles.root} onLayout={onLayout} testID={`g2-clock-l${level ?? 0}-${hour}`}>
      {size ? (
        <>
          <View style={[styles.strip, solved ? styles.stripWin : null]} accessible accessibilityLabel={`Set the clock to ${hour} o'clock`}>
            <Text style={styles.stripText}>{`${hour} o'clock`}</Text>
          </View>
          <Prompt text={prompt} clipId={`${id}-set`} waiting={waiting} silent={solved} />

          <View
            style={[styles.face, { width: face, height: face, borderRadius: r }, solved ? styles.faceWin : null]}
            accessible={false}
            accessibilityLabel={`The clock shows ${shown} o'clock`}
          >
            {HOURS.map((n) => {
              const a = (n * 30 * Math.PI) / 180;
              const x = r + ring * Math.sin(a) - TARGET / 2;
              const y = r - ring * Math.cos(a) - TARGET / 2;
              return (
                <Pressable
                  key={n}
                  onPress={() => tapHour(n)}
                  disabled={solved}
                  accessibilityRole="button"
                  accessibilityLabel={`${n}`}
                  style={[styles.num, { left: x, top: y }, hint && n === hour ? styles.numHint : null, shown === n && n !== 12 ? styles.numOn : null]}
                >
                  <Text style={styles.numText}>{n}</Text>
                </Pressable>
              );
            })}
            <View style={[styles.pivot, { left: r, top: r }]}>
              <Hand length={ring - 12} width={8} color={colors.atTeal} angle={0} />
              <Hand length={ring * 0.55} width={12} color={colors.atPurple} angle={angle} />
              <View style={styles.cap} />
            </View>
          </View>

          <View style={styles.key}>
            <View style={styles.keyItem}>
              <View style={[styles.swatch, { backgroundColor: colors.atPurple }]} />
              <Text style={styles.keyText}>short hand: the hour</Text>
            </View>
            <View style={styles.keyItem}>
              <View style={[styles.swatch, { backgroundColor: colors.atTeal }]} />
              <Text style={styles.keyText}>{"long hand on 12: o'clock"}</Text>
            </View>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 12 },
  strip: {
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.atMintDeep,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  stripWin: { borderColor: "#E0A800", backgroundColor: colors.atCream },
  stripText: { fontFamily: fonts.bodyBold, fontSize: 26, color: colors.atTeal },
  face: { backgroundColor: colors.white, borderWidth: 6, borderColor: colors.atTeal, marginTop: 6 },
  faceWin: { borderColor: colors.atYellow },
  num: { position: "absolute", width: TARGET, height: TARGET, borderRadius: TARGET, alignItems: "center", justifyContent: "center" },
  numOn: { backgroundColor: colors.atPurpleLight },
  numHint: { borderWidth: 3, borderColor: colors.atYellow, backgroundColor: colors.atCream },
  numText: { fontFamily: fonts.bodyBold, fontSize: 24, color: colors.atInk },
  pivot: { position: "absolute", width: 0, height: 0 },
  hand: { position: "absolute", left: 0, top: 0, transformOrigin: "bottom" },
  cap: { position: "absolute", width: 18, height: 18, borderRadius: 9, left: -9, top: -9, backgroundColor: colors.atInk },
  key: { gap: 4, alignItems: "flex-start" },
  keyItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  swatch: { width: 22, height: 8, borderRadius: 4 },
  keyText: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.atInk },
});
