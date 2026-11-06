import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import CounterFace, { type CounterItem } from "@/features/play/components/CounterFace";
import SpokenText from "@/components/ui/SpokenText";
import { ArrowRightIcon, ReplayIcon } from "@/components/ui/icons";
import { narration } from "@/services/narration";
import type { PlaceValuePuzzle } from "@/types/domain";
import { colors, fonts } from "@/theme";

import { CountBubble } from "../ten-frame/components/CountBubble";
import { NumberTile } from "../ten-frame/components/NumberTile";
import { WhiteTenFrame } from "../ten-frame/components/WhiteTenFrame";

export const TARGET = 48;

export interface Bubble {
  label: number;
  delayMs: number;
  n: number;
}

export function Crate({
  item,
  cell,
  filled = 10,
  bubble,
  glow,
  countLast,
  countAt,
}: Readonly<{
  item: CounterItem;
  cell: number;
  filled?: number;
  bubble?: Bubble;
  glow?: boolean;
  countLast?: boolean;
  countAt?: (slot: number) => Bubble | undefined;
}>) {
  return (
    <WhiteTenFrame
      cell={cell}
      gap={Math.max(1, Math.round(cell * 0.12))}
      pad={Math.max(2, Math.round(cell * 0.18))}
      win={filled === 10}
      style={glow ? styles.glow : null}
      renderSlot={(slot) => {
        const at = countAt?.(slot);
        return (
          <>
            {slot < filled ? <CounterFace item={item} palette="teal" size={cell * 0.92} /> : null}
            {countLast && slot === filled - 1 ? <CountBubble key={filled} label={filled} delayMs={0} size={cell} /> : null}
            {at ? <CountBubble key={at.n} label={at.label} delayMs={at.delayMs} size={cell} /> : null}
          </>
        );
      }}
    >
      {bubble ? <CountBubble key={bubble.n} label={bubble.label} delayMs={bubble.delayMs} size={cell * 5} /> : null}
    </WhiteTenFrame>
  );
}

export function Loose({ item, size, fresh, bubble }: Readonly<{ item: CounterItem; size: number; fresh?: boolean; bubble?: Bubble }>) {
  return (
    <View style={[{ width: size, height: size, borderRadius: size }, fresh ? styles.fresh : null]}>
      <CounterFace item={item} palette={fresh ? "purple" : "teal"} size={size * 0.9} />
      {bubble ? <CountBubble key={bubble.n} label={bubble.label} delayMs={bubble.delayMs} size={size} /> : null}
    </View>
  );
}

export function Prompt({ text, clipId, waiting, silent }: Readonly<{ text: string; clipId: string; waiting?: boolean; silent?: boolean }>) {
  useEffect(() => {
    if (waiting || silent) return;
    narration.prompt(text, clipId);
  }, [text, clipId, waiting, silent]);
  useEffect(() => () => narration.stop(), []);
  return (
    <View style={partStyles.pill} accessibilityLiveRegion="polite">
      <SpokenText text={text} style={partStyles.pillText} />
    </View>
  );
}

export function Equation({
  op,
  a,
  b,
  answer,
  solved,
}: Readonly<{ op: Exclude<PlaceValuePuzzle["op"], "build">; a: number; b: number; answer: number; solved: boolean }>) {
  const tile = 46;
  const font = 24;
  const sign = (s: string) => <Text style={styles.op}>{s}</Text>;
  return (
    <View
      style={[styles.strip, solved ? styles.stripWin : null]}
      accessible
      accessibilityLabel={`${a} ${op === "add" ? "plus" : "take away"} ${b} equals ${solved ? answer : "what"}`}
    >
      <NumberTile value={a} tone="total" size={tile} fontSize={font} />
      {sign(op === "add" ? "+" : "−")}
      <NumberTile value={b} tone="five" size={tile} fontSize={font} />
      {sign("=")}
      <NumberTile value={solved ? answer : "?"} tone={solved ? "win" : "ask"} size={tile} fontSize={font} />
    </View>
  );
}

export const partStyles = StyleSheet.create({
  pill: {
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.atMintDeep,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  pillText: { fontFamily: fonts.headingSemiBold, fontSize: 20, color: colors.atInk, textAlign: "center" },
  head: { fontFamily: fonts.headingBold, fontSize: 16, color: colors.atTeal },
  choices: { flexDirection: "row", gap: 12 },
  choice: {
    minWidth: 72,
    minHeight: TARGET,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.atTealLight,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceText: { fontFamily: fonts.bodyBold, fontSize: 26, color: colors.atTeal },
});

const styles = StyleSheet.create({
  glow: { shadowColor: colors.atYellow, shadowOpacity: 0.9, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
  fresh: { backgroundColor: colors.atPurpleLight },
  strip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.atMintDeep,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  stripWin: { borderColor: "#E0A800", backgroundColor: colors.atCream },
  op: { fontFamily: fonts.bodyBold, fontSize: 24, color: colors.atInk },
  word: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.atInk },
  replayRow: { flexDirection: "row", gap: 12 },
  replay: { flexDirection: "row", gap: 6, paddingHorizontal: 16 },
  replayText: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.atTeal },
  next: { flexDirection: "row", gap: 6, paddingHorizontal: 22, backgroundColor: colors.atTeal, borderColor: colors.atTeal },
  nextText: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.white },
});

export function ReplayOrNext({ onReplay, onNext }: Readonly<{ onReplay: () => void; onNext: () => void }>) {
  return (
    <View style={styles.replayRow}>
      <Pressable onPress={onReplay} accessibilityRole="button" accessibilityLabel="Show me again" style={[partStyles.choice, styles.replay]}>
        <ReplayIcon size={26} color={colors.atTeal} strokeWidth={2.6} />
        <Text style={styles.replayText}>Again</Text>
      </Pressable>
      <Pressable onPress={onNext} accessibilityRole="button" accessibilityLabel="Next" style={[partStyles.choice, styles.next]}>
        <Text style={styles.nextText}>Next</Text>
        <ArrowRightIcon size={28} color={colors.white} strokeWidth={2.8} />
      </Pressable>
    </View>
  );
}
