/**
 * The white ten-frame of the Grade 1 Count and Take-away levels (2 rows of 5 mint slots, dark edge underneath).
 * Grade 2 uses the same frame as "a ten", so the child sees one picture of ten throughout. Draws at any cell
 * size: full size on a board, small on the Grade 2 shelf of full frames.
 */

import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { colors } from "@/theme";

const SLOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function WhiteTenFrame({
  cell,
  gap,
  pad,
  win,
  style,
  accessibilityLabel,
  renderSlot,
  children,
}: Readonly<{
  cell: number;
  gap: number;
  pad: number;
  /** Gold edge: the frame is complete. */
  win?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  /** What sits in each slot (an item, or nothing). */
  renderSlot: (slot: number) => ReactNode;
  /** Drawn over the frame (a count bubble). */
  children?: ReactNode;
}>) {
  const radius = Math.min(24, Math.round(cell * 0.6));
  return (
    <View style={[styles.edge, { borderRadius: radius, paddingBottom: Math.max(2, Math.round(cell * 0.1)) }, win ? styles.edgeWin : null, style]}>
      <View
        style={[styles.frame, { borderRadius: radius, padding: pad, gap, borderWidth: cell < 20 ? 1.5 : 3 }, win ? styles.frameWin : null]}
        accessibilityLabel={accessibilityLabel}
      >
        {[0, 1].map((row) => (
          <View key={row} style={[styles.row, { gap }]}>
            {SLOTS.slice(row * 5, row * 5 + 5).map((slot) => (
              <View key={slot} style={[styles.slot, { width: cell, height: cell, borderRadius: Math.round(cell * 0.23), borderWidth: cell < 20 ? 1 : 2 }]}>
                <View style={[styles.dimple, { width: cell * 0.72, height: cell * 0.72, borderRadius: cell }]} />
                {renderSlot(slot)}
              </View>
            ))}
          </View>
        ))}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  edge: { backgroundColor: colors.atInk },
  edgeWin: { backgroundColor: "#C48A00" },
  frame: { backgroundColor: colors.white, borderColor: "rgba(0,79,74,0.2)" },
  frameWin: { borderColor: colors.atYellow },
  row: { flexDirection: "row" },
  slot: { alignItems: "center", justifyContent: "center", backgroundColor: colors.atMint, borderColor: "rgba(0,111,104,0.14)" },
  dimple: { position: "absolute", backgroundColor: "rgba(255,255,255,0.75)" },
});
