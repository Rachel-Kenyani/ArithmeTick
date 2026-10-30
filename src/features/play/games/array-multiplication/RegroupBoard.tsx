/**
 * Phase B — regroup. The finished array sits beside a place-value board (Tens | Ones). Each tapped tile
 * lights up and fills one slot of the ten-rod; at 10 the picked tiles leave the array, the rod turns gold
 * and the leftovers drop into Ones: 1 ten + k ones. Plain views and entering/exiting layout animations
 * only — nothing animates per frame while the child is thinking.
 */

import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut, ReduceMotion, ZoomIn } from "react-native-reanimated";

import { colors, fonts } from "@/theme";

import { ROW_TONES, TEN, type Puzzle } from "./logic";

const ENTER = ZoomIn.springify().stiffness(320).damping(22).reduceMotion(ReduceMotion.System);
const FADE_IN = FadeIn.duration(260).reduceMotion(ReduceMotion.System);
const FADE_OUT = FadeOut.duration(220).reduceMotion(ReduceMotion.System);
const SLOTS = Array.from({ length: TEN }, (_, i) => i);

export interface RegroupGeometry {
  /** Array tile pitch. */
  pitch: number;
  /** Rod segment height (and ones tile size). */
  seg: number;
}

interface RegroupBoardProps {
  pz: Puzzle;
  geo: RegroupGeometry;
  picked: readonly number[];
  bundled: boolean;
  palActive: boolean;
  onTap: (tile: number) => void;
}

export const RegroupBoard = memo(function RegroupBoard({ pz, geo, picked, bundled, palActive, onTap }: Readonly<RegroupBoardProps>) {
  const { pitch, seg } = geo;
  const inset = Math.max(3, Math.round(pitch * 0.08));
  const tile = pitch - inset * 2;
  const leftovers = Array.from({ length: pz.count }, (_, i) => i).filter((i) => !picked.includes(i));

  return (
    <View style={styles.row}>
      {bundled ? null : (
        <Animated.View exiting={FADE_OUT} style={{ width: pz.cols * pitch, height: pz.rows * pitch }}>
          {Array.from({ length: pz.count }, (_, i) => {
            const r = Math.floor(i / pz.cols);
            const order = picked.indexOf(i);
            const on = order >= 0;
            return (
              <Pressable
                key={i}
                onPress={() => onTap(i)}
                hitSlop={inset}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={on ? `Tile ${order + 1} of ten, picked` : "Tile"}
                style={[
                  styles.tile,
                  { left: (i % pz.cols) * pitch + inset, top: r * pitch + inset, width: tile, height: tile, borderRadius: tile * 0.22 },
                  palActive ? { backgroundColor: ROW_TONES[r], borderColor: "rgba(0,0,0,0.18)" } : null,
                  on ? styles.picked : null,
                ]}
              >
                {on ? <Text style={[styles.order, { fontSize: Math.round(tile * 0.42) }]}>{order + 1}</Text> : null}
              </Pressable>
            );
          })}
        </Animated.View>
      )}

      <View style={styles.board} accessible accessibilityLabel={bundled ? `1 ten and ${pz.ones} ones` : `Ten-rod, ${picked.length} of 10`}>
        <View style={styles.col}>
          <Text style={styles.head}>Tens</Text>
          <View style={[styles.rod, bundled ? styles.rodDone : null, { width: seg + 12 }]}>
            {SLOTS.map((s) => (
              <View key={s} style={[styles.seg, { width: seg, height: seg - 2 }, s < picked.length ? (bundled ? styles.segGold : styles.segOn) : null]} />
            ))}
          </View>
          {bundled ? (
            <Animated.Text entering={ENTER} style={styles.count}>
              1
            </Animated.Text>
          ) : null}
        </View>
        <View style={styles.divider} />
        <View style={styles.col}>
          <Text style={styles.head}>Ones</Text>
          <View style={[styles.ones, { width: seg * 2 + 18, minHeight: seg * 2 + 12 }]}>
            {bundled
              ? leftovers.map((i, k) => (
                  <Animated.View
                    key={i}
                    entering={FADE_IN.delay(120 + k * 90)}
                    style={[styles.one, { width: seg, height: seg, borderRadius: seg * 0.22 }, palActive ? { backgroundColor: ROW_TONES[Math.floor(i / pz.cols)] } : null]}
                  />
                ))
              : null}
          </View>
          {bundled ? (
            <Animated.Text entering={ENTER} style={styles.count}>
              {pz.ones}
            </Animated.Text>
          ) : null}
        </View>
      </View>
    </View>
  );
});

/** Biggest array pitch / rod segment that fit the stage side by side. */
export function regroupGeometry(w: number, h: number, pz: Puzzle): RegroupGeometry {
  // rod: 10 segments + header + count; board ≈ 2 columns of (2·seg + 18) + divider + padding
  const segByH = (h - 96) / TEN;
  const pitchByH = h / pz.rows;
  // width: cols·p + gap 16 + board (≈ 4·seg + 70), with seg ≈ 0.6·p
  const pitchByW = (w - 86) / (pz.cols + 2.4);
  const pitch = Math.max(28, Math.min(64, pitchByH, pitchByW));
  const seg = Math.max(14, Math.min(36, segByH, pitch * 0.6));
  return { pitch: Math.floor(pitch), seg: Math.floor(seg) };
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 },
  tile: { position: "absolute", backgroundColor: colors.atTealLight, borderWidth: 2, borderColor: colors.atTeal, alignItems: "center", justifyContent: "center" },
  picked: { backgroundColor: colors.atYellow, borderColor: "#E0A800", borderWidth: 3 },
  order: { fontFamily: fonts.bodyBold, color: colors.atInk },
  board: { flexDirection: "row", backgroundColor: colors.atCream, borderRadius: 18, borderWidth: 3, borderColor: colors.atMintDeep, padding: 8 },
  col: { alignItems: "center", gap: 4 },
  head: { fontFamily: fonts.headingBold, fontSize: 14, color: colors.atTeal },
  divider: { width: 2, backgroundColor: colors.atMintDeep, marginHorizontal: 8 },
  rod: { alignItems: "center", gap: 2, paddingVertical: 4, borderRadius: 10, borderWidth: 2, borderColor: "rgba(0,111,104,0.25)", backgroundColor: colors.white },
  rodDone: { borderColor: "#E0A800", backgroundColor: colors.atYellowSoft },
  seg: { borderRadius: 4, backgroundColor: "rgba(0,111,104,0.08)" },
  segOn: { backgroundColor: colors.atTealLight },
  segGold: { backgroundColor: colors.atYellow },
  ones: { flexDirection: "row", flexWrap: "wrap", alignContent: "flex-start", justifyContent: "center", gap: 6, padding: 4 },
  one: { backgroundColor: colors.atTealLight, borderWidth: 2, borderColor: colors.atTeal },
  count: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.atInk },
});
