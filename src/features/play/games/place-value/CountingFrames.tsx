import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { ReduceMotion, ZoomIn } from "react-native-reanimated";

import CounterFace from "@/features/play/components/CounterFace";
import { colors, fonts } from "@/theme";

import { WhiteTenFrame } from "../ten-frame/components/WhiteTenFrame";

type Palette = "teal" | "purple" | "gold";

const POP = ZoomIn.springify().stiffness(420).damping(18).reduceMotion(ReduceMotion.System);
const TRAY_PAD = 8;
const FRAME_GAP = 10;
const TALLY_HEIGHT = 0;

export function slotOwners(terms: number[]): number[] {
  return terms.flatMap((n, t) => Array.from({ length: n }, () => t));
}

export function paletteFor(term: number, terms: number, carried: boolean): Palette {
  if (carried && term === 0) return "gold";
  return term === terms - 1 && terms > 1 ? "purple" : "teal";
}

export function framesLayout(room: { w: number; h: number }, total: number): { cell: number; stacked: boolean } {
  const frames = Math.max(1, Math.ceil(total / 10));
  const w = room.w - TRAY_PAD * 2 - 4;
  const h = room.h - TRAY_PAD * 2 - 4 - TALLY_HEIGHT;
  const fit = (across: number, down: number) =>
    Math.min((w - (across - 1) * FRAME_GAP - 6 * across) / (5.84 * across), (h - (down - 1) * FRAME_GAP - 8 * down) / (2.5 * down));
  const side = fit(frames, 1);
  const stack = fit(1, frames);
  const stacked = frames > 1 && stack > side;
  return { cell: Math.floor(Math.max(22, Math.min(64, stacked ? stack : side))), stacked };
}

export default function CountingFrames({
  terms,
  carried,
  marks,
  cell,
  stacked,
  onTap,
}: Readonly<{
  terms: number[];
  carried: boolean;
  marks: Partial<Record<number, number>>;
  cell: number;
  stacked: boolean;
  onTap: (index: number) => void;
}>) {
  const owners = slotOwners(terms);
  const total = owners.length;
  const frames = Math.max(1, Math.ceil(total / 10));
  const counted = Object.keys(marks).length;
  return (
    <View style={styles.root} accessibilityLabel={`${terms.join(" plus ")} bottle tops. Counted ${counted} of ${total}`}>
      <View style={[styles.frames, stacked ? styles.stacked : null]}>
        {Array.from({ length: frames }, (_, f) => (
          <WhiteTenFrame
            key={`frame-${f + 1}`}
            cell={cell}
            gap={Math.max(1, Math.round(cell * 0.12))}
            pad={Math.max(2, Math.round(cell * 0.18))}
            win={total >= (f + 1) * 10}
            renderSlot={(slot) => {
              const i = f * 10 + slot;
              if (i >= total) return null;
              return <CountCap mark={marks[i]} palette={paletteFor(owners[i], terms.length, carried)} cell={cell} onTap={() => onTap(i)} />;
            }}
          />
        ))}
      </View>
    </View>
  );
}

export function CountCap({ mark, taken, palette, cell, onTap }: Readonly<{ mark?: number; taken?: boolean; palette: Palette; cell: number; onTap: () => void }>) {
  if (taken) {
    return (
      <View style={[styles.cap, { width: cell, height: cell }]} accessibilityLabel="Taken away">
        <View style={[{ width: cell * 0.92, height: cell * 0.92 }, styles.gone]}>
          <CounterFace item="cap" palette={palette} size={cell * 0.92} />
        </View>
        <View style={[styles.slash, { width: cell * 0.95, height: Math.max(3, cell * 0.1), transform: [{ rotate: "-45deg" }] }]} />
        <View style={[styles.slash, { width: cell * 0.95, height: Math.max(3, cell * 0.1), transform: [{ rotate: "45deg" }] }]} />
      </View>
    );
  }
  return (
    <Pressable
      onPress={onTap}
      disabled={mark !== undefined}
      accessibilityRole="button"
      accessibilityLabel={mark === undefined ? "Bottle top. Tap to count it" : `Counted, number ${mark}`}
      hitSlop={4}
      style={[styles.cap, { width: cell, height: cell }]}
    >
      <View style={[{ width: cell * 0.92, height: cell * 0.92 }, mark === undefined ? null : styles.done]}>
        <CounterFace item="cap" palette={palette} size={cell * 0.92} />
      </View>
      {mark === undefined ? null : (
        <Animated.View entering={POP} style={[styles.badge, { width: cell * 0.62, height: cell * 0.62, borderRadius: cell }]}>
          <Text style={[styles.badgeText, { fontSize: cell * 0.36 }]}>{mark}</Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: "center", gap: 6, padding: TRAY_PAD, borderRadius: 16, backgroundColor: colors.atCream, borderWidth: 2, borderColor: colors.atMintDeep },
  frames: { flexDirection: "row", justifyContent: "center", gap: FRAME_GAP },
  stacked: { flexDirection: "column" },
  cap: { alignItems: "center", justifyContent: "center" },
  done: { opacity: 0.55 },
  gone: { opacity: 0.3 },
  slash: { position: "absolute", borderRadius: 4, backgroundColor: "#c0392b" },
  badge: { position: "absolute", alignItems: "center", justifyContent: "center", backgroundColor: colors.atInk },
  badgeText: { fontFamily: fonts.headingBold, color: colors.white },
});
