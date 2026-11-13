import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { ReduceMotion, ZoomIn } from "react-native-reanimated";

import CounterFace, { type CounterItem } from "@/features/play/components/CounterFace";
import { colors, fonts } from "@/theme";

import type { Puzzle } from "./logic";

const POP = ZoomIn.springify().stiffness(320).damping(22).reduceMotion(ReduceMotion.System);
const TOTAL_W = 56;
const BED_PAD = 8;
const BED_GAP = 10;

interface CountBedsProps {
  pz: Puzzle;
  item: CounterItem;
  counted: readonly number[];
  width: number;
  height: number;
  disabled: boolean;
  onTapRow: (row: number) => void;
}

export const CountBeds = memo(function CountBeds({ pz, item, counted, width, height, disabled, onTapRow }: Readonly<CountBedsProps>) {
  const seed = Math.floor(Math.max(28, Math.min(60, (width - TOTAL_W * 2 - 24 - BED_PAD * 2 - 6) / pz.cols, (height - BED_GAP * (pz.rows - 1)) / pz.rows - BED_PAD * 2)));

  return (
    <View style={styles.beds}>
      {Array.from({ length: pz.rows }, (_, r) => {
        const order = counted.indexOf(r);
        const on = order >= 0;
        const total = (order + 1) * pz.cols;
        return (
          <View key={r} style={styles.line}>
            <View style={{ width: TOTAL_W }} />
            <Pressable
              onPress={() => onTapRow(r)}
              disabled={disabled || on}
              accessibilityRole="button"
              accessibilityState={{ selected: on, disabled: disabled || on }}
              accessibilityLabel={on ? `Row ${r + 1}, counted. ${total} seeds so far` : `Row ${r + 1}, ${pz.cols} seeds. Tap to count`}
              style={({ pressed }) => [styles.bed, { padding: BED_PAD }, on ? styles.bedOn : null, pressed ? styles.pressed : null]}
            >
              {Array.from({ length: pz.cols }, (_, c) => (
                <View key={c} style={{ width: seed, height: seed, alignItems: "center", justifyContent: "center" }}>
                  <CounterFace item={item} palette={on ? "gold" : "teal"} size={seed * 0.82} />
                </View>
              ))}
            </Pressable>
            <View style={[styles.totalSlot, { width: TOTAL_W }]}>
              {on ? (
                <Animated.View entering={POP} style={styles.total}>
                  <Text style={styles.totalText}>{total}</Text>
                </Animated.View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  beds: { gap: BED_GAP, alignItems: "center" },
  line: { flexDirection: "row", alignItems: "center", gap: 12 },
  bed: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#8B5E3C",
    backgroundColor: "#D9B88F",
  },
  bedOn: { borderColor: "#E0A800", backgroundColor: colors.atYellowSoft },
  pressed: { transform: [{ scale: 0.98 }] },
  totalSlot: { alignItems: "center", justifyContent: "center" },
  total: {
    minWidth: 48,
    height: 40,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#E0A800",
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  totalText: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.atInk },
});
