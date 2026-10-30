/**
 * Phase A — stretch the array. Touching or dragging anywhere on the 5 × 6 guide makes the cell under the
 * finger the array's bottom-right corner; the corner handle follows. The drag maths runs on the UI
 * thread and only crosses to JS when the size actually changes, so it stays smooth on budget phones.
 * With help on, rows lock to the target, columns stop at it and each row is banded with a skip count.
 */

import { memo, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { colors, fonts } from "@/theme";

import { useBreath } from "../ten-frame/hooks/useBreath";
import { SPRING_UI } from "../ten-frame/utils/motion";
import { MAX_COLS, MAX_ROWS, ROW_TONES, dimLimits, dimsAt, type Dims, type Puzzle } from "./logic";

const GUIDE = Array.from({ length: MAX_ROWS * MAX_COLS }, (_, i) => ({ r: Math.floor(i / MAX_COLS), c: i % MAX_COLS }));
export const SKIP_W = 40;

interface ArrayBuilderProps {
  pz: Puzzle;
  dims: Dims;
  pitch: number;
  palActive: boolean;
  locked: boolean;
  hinting: boolean;
  reduced: boolean;
  onDims: (rows: number, cols: number) => void;
  onGrab: () => void;
}

export const ArrayBuilder = memo(function ArrayBuilder({ pz, dims, pitch, palActive, locked, hinting, reduced, onDims, onGrab }: Readonly<ArrayBuilderProps>) {
  const limits = useSharedValue(dimLimits(pz, palActive));
  const last = useSharedValue({ rows: dims.rows, cols: dims.cols });
  useEffect(() => {
    limits.set(dimLimits(pz, palActive));
  }, [limits, pz, palActive]);
  useEffect(() => {
    last.set({ rows: dims.rows, cols: dims.cols });
  }, [last, dims.rows, dims.cols]);

  const follow = (x: number, y: number) => {
    "worklet";
    const next = dimsAt(x, y, pitch, limits.get());
    const prev = last.get();
    if (next.rows === prev.rows && next.cols === prev.cols) return;
    last.set(next);
    scheduleOnRN(onDims, next.rows, next.cols);
  };
  const pan = usePanGesture({
    enabled: !locked,
    maxPointers: 1,
    minDistance: 0,
    onBegin: (e) => {
      scheduleOnRN(onGrab);
      follow(e.x, e.y);
    },
    onUpdate: (e) => follow(e.x, e.y),
  });

  // The corner handle springs to the array's corner.
  const hx = useSharedValue(dims.cols * pitch);
  const hy = useSharedValue(dims.rows * pitch);
  useEffect(() => {
    hx.set(withSpring(dims.cols * pitch, SPRING_UI));
    hy.set(withSpring(dims.rows * pitch, SPRING_UI));
  }, [dims.cols, dims.rows, pitch, hx, hy]);
  const breath = useBreath(hinting && !locked && !reduced, 1, 1.18, 1, 1100);
  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: hx.get() - HANDLE / 2 }, { translateY: hy.get() - HANDLE / 2 }, { scale: breath.get() }],
  }));

  const inset = Math.max(3, Math.round(pitch * 0.08));
  const tile = pitch - inset * 2;
  const full = dims.cols === pz.cols;

  return (
    <View
      style={{ width: MAX_COLS * pitch + SKIP_W, height: MAX_ROWS * pitch }}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={`Array, ${dims.rows} rows of ${dims.cols}`}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }, { name: "addRow", label: "Add a row" }, { name: "removeRow", label: "Remove a row" }]}
      onAccessibilityAction={(e) => {
        const l = dimLimits(pz, palActive);
        const step = { increment: [0, 1], decrement: [0, -1], addRow: [1, 0], removeRow: [-1, 0] }[e.nativeEvent.actionName] ?? [0, 0];
        const rows = Math.min(l.maxRows, Math.max(l.minRows, dims.rows + step[0]));
        const cols = Math.min(l.maxCols, Math.max(1, dims.cols + step[1]));
        onDims(rows, cols);
      }}
    >
      <GestureDetector gesture={pan}>
        <View style={{ width: MAX_COLS * pitch, height: MAX_ROWS * pitch }}>
          {GUIDE.map(({ r, c }) => {
            const on = r < dims.rows && c < dims.cols;
            const band = palActive ? ROW_TONES[r] : undefined;
            const blocked = palActive && (c >= pz.cols || r >= pz.rows);
            return (
              <View
                key={`${r}:${c}`}
                style={[
                  styles.cell,
                  { left: c * pitch + inset, top: r * pitch + inset, width: tile, height: tile, borderRadius: tile * 0.22 },
                  on ? [styles.tile, band ? { backgroundColor: band, borderColor: "rgba(0,0,0,0.18)" } : null, locked ? styles.tileLocked : null] : null,
                  !on && blocked ? styles.blocked : null,
                ]}
              />
            );
          })}
          <Animated.View pointerEvents="none" style={[styles.handle, handleStyle]}>
            <Text style={styles.grip}>↘</Text>
          </Animated.View>
        </View>
      </GestureDetector>

      {palActive && full
        ? Array.from({ length: dims.rows }, (_, r) => (
            <View key={r} style={[styles.skip, { left: MAX_COLS * pitch + 4, top: r * pitch + (pitch - 30) / 2, borderColor: ROW_TONES[r] }]}>
              <Text style={styles.skipText}>{(r + 1) * dims.cols}</Text>
            </View>
          ))
        : null}
    </View>
  );
});

const HANDLE = 44;

const styles = StyleSheet.create({
  cell: { position: "absolute", backgroundColor: "rgba(0,111,104,0.07)", borderWidth: 2, borderColor: "rgba(0,111,104,0.14)" },
  tile: { backgroundColor: colors.atTealLight, borderColor: colors.atTeal },
  tileLocked: { borderColor: "#E0A800", borderWidth: 3 },
  blocked: { backgroundColor: "rgba(0,0,0,0.03)", borderColor: "rgba(0,0,0,0.05)" },
  handle: {
    position: "absolute",
    left: 0,
    top: 0,
    width: HANDLE,
    height: HANDLE,
    borderRadius: HANDLE / 2,
    backgroundColor: colors.atYellow,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  grip: { fontFamily: fonts.bodyBold, fontSize: 22, lineHeight: 26, color: colors.atInk },
  skip: { position: "absolute", width: SKIP_W - 6, height: 30, borderRadius: 15, borderWidth: 2, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  skipText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.atInk },
});
