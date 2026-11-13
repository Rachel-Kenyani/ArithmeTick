import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/theme";

import { CountCap, paletteFor } from "./CountingFrames";

const PER_ROW = 5;
const GROUP_PAD = 8;
const LABEL_W = 34;
const SIGN_SIZE = 26;
const GAP_RATIO = 0.12;

const rowsOf = (n: number) => Math.max(1, Math.ceil(n / PER_ROW));
const unit = 1 + GAP_RATIO;

export function groupsLayout(room: { w: number; h: number }, terms: number[]): { cell: number; stacked: boolean } {
  const k = terms.length;
  const signs = (k - 1) * (SIGN_SIZE + 8);
  const chrome = LABEL_W + GROUP_PAD * 2 + 8;
  const stackW = (room.w - chrome) / (PER_ROW * unit);
  const stackH = (room.h - signs - k * (GROUP_PAD * 2 + 4)) / (terms.reduce((s, n) => s + rowsOf(n), 0) * unit);
  const sideW = (room.w - signs - k * chrome) / (terms.reduce((s, n) => s + Math.min(n, PER_ROW), 0) * unit);
  const sideH = (room.h - GROUP_PAD * 2 - 4) / (Math.max(...terms.map(rowsOf)) * unit);
  const stack = Math.min(stackW, stackH);
  const side = Math.min(sideW, sideH);
  const stacked = stack >= side;
  return { cell: Math.floor(Math.max(22, Math.min(64, stacked ? stack : side))), stacked };
}

export default function CountingGroups({
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
  const starts = terms.map((_, t) => terms.slice(0, t).reduce((s, n) => s + n, 0));
  const gap = Math.max(2, Math.round(cell * GAP_RATIO));
  return (
    <View style={[styles.root, stacked ? null : styles.side]} accessibilityLabel={`${terms.join(" plus ")}. Count the bottle tops.`}>
      {terms.map((n, t) => {
        const palette = paletteFor(t, terms.length, carried);
        const ids = Array.from({ length: n }, (_, k) => starts[t] + k);
        return (
          <View key={`term-${starts[t]}`} style={[styles.termRow, stacked ? null : styles.termSide]}>
            {t > 0 ? <Text style={styles.sign}>+</Text> : null}
            <View style={[styles.group, carried && t === 0 ? styles.groupCarried : null]}>
              <Text style={styles.label}>{n}</Text>
              <View style={[styles.caps, { gap, width: Math.min(n, PER_ROW) * cell + (Math.min(n, PER_ROW) - 1) * gap }]}>
                {ids.map((i) => (
                  <CountCap key={`cap-${i}`} mark={marks[i]} palette={palette} cell={cell} onTap={() => onTap(i)} />
                ))}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: "center", gap: 4 },
  side: { flexDirection: "row" },
  termRow: { alignItems: "center", gap: 4 },
  termSide: { flexDirection: "row" },
  sign: { fontFamily: fonts.headingBold, fontSize: 24, lineHeight: SIGN_SIZE, color: colors.atInk },
  group: { flexDirection: "row", alignItems: "center", gap: 8, padding: GROUP_PAD, borderRadius: 14, backgroundColor: colors.atCream, borderWidth: 2, borderColor: colors.atMintDeep },
  groupCarried: { borderColor: colors.atYellow, borderStyle: "dashed" },
  label: { width: LABEL_W - 8, textAlign: "center", fontFamily: fonts.headingBold, fontSize: 22, color: colors.atInk },
  caps: { flexDirection: "row", flexWrap: "wrap" },
});
