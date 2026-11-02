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
  pitch: number;
  seg: number;
  stacked: boolean;
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
  const { pitch, seg, stacked } = geo;
  const inset = Math.max(3, Math.round(pitch * 0.08));
  const tile = pitch - inset * 2;
  const leftovers = Array.from({ length: pz.count }, (_, i) => i).filter((i) => !picked.includes(i));

  return (
    <View style={stacked ? styles.stack : styles.row}>
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

      <View style={[styles.board, stacked ? styles.boardFlat : null]} accessible accessibilityLabel={bundled ? `1 ten and ${pz.ones} ones` : `Ten-rod, ${picked.length} of 10`}>
        <View style={[styles.col, stacked ? styles.colFlat : null]}>
          <Text style={styles.head}>Tens</Text>
          <View style={[styles.rod, bundled ? styles.rodDone : null, stacked ? styles.rodFlat : { width: seg + 12 }]}>
            {SLOTS.map((s) => (
              <View
                key={s}
                style={[styles.seg, stacked ? { width: seg - 2, height: seg } : { width: seg, height: seg - 2 }, s < picked.length ? (bundled ? styles.segGold : styles.segOn) : null]}
              />
            ))}
          </View>
          {bundled ? (
            <Animated.Text entering={ENTER} style={styles.count}>
              1
            </Animated.Text>
          ) : null}
        </View>
        <View style={stacked ? styles.dividerFlat : styles.divider} />
        <View style={[styles.col, stacked ? styles.colFlat : null]}>
          <Text style={styles.head}>Ones</Text>
          <View style={[styles.ones, stacked ? { width: TEN * seg, minHeight: seg + 8 } : { width: seg * 2 + 18, minHeight: seg * 2 + 12 }]}>
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

const MIN_PITCH = 48;

export function regroupGeometry(w: number, h: number, pz: Puzzle): RegroupGeometry {
  const segByH = (h - 96) / TEN;
  const pitchByW = (w - 86) / (pz.cols + 2.4);
  const side = Math.min(64, h / pz.rows, pitchByW);
  if (side >= MIN_PITCH) {
    const seg = Math.max(14, Math.min(36, segByH, side * 0.6));
    return { pitch: Math.floor(side), seg: Math.floor(seg), stacked: false };
  }
  const pitch = Math.max(MIN_PITCH, Math.min(64, w / pz.cols, (h - 16 - 110) / pz.rows));
  const seg = Math.max(14, Math.min(30, (w - 90) / TEN, (h - 16 - pz.rows * pitch - 50) / 2));
  return { pitch: Math.floor(pitch), seg: Math.floor(seg), stacked: true };
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 },
  stack: { alignItems: "center", justifyContent: "center", gap: 16 },
  tile: { position: "absolute", backgroundColor: colors.atTealLight, borderWidth: 2, borderColor: colors.atTeal, alignItems: "center", justifyContent: "center" },
  picked: { backgroundColor: colors.atYellow, borderColor: "#E0A800", borderWidth: 3 },
  order: { fontFamily: fonts.bodyBold, color: colors.atInk },
  board: { flexDirection: "row", backgroundColor: colors.atCream, borderRadius: 18, borderWidth: 3, borderColor: colors.atMintDeep, padding: 8 },
  col: { alignItems: "center", gap: 4 },
  boardFlat: { flexDirection: "column", alignItems: "center" },
  colFlat: { flexDirection: "row", gap: 8 },
  dividerFlat: { height: 2, alignSelf: "stretch", backgroundColor: colors.atMintDeep, marginVertical: 6 },
  rodFlat: { flexDirection: "row", paddingVertical: 0, paddingHorizontal: 4 },
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
