// TEMPORARY stand-in — replaced when BadgeMedallion is ported (see README).

import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import type { BadgeDef, BadgeTone } from "@/data/badges";
import { colors } from "@/theme";

export interface BadgeMedallionProps {
  badge: BadgeDef;
  /** false → muted silhouette with a padlock (default true). */
  earned?: boolean;
  /** px diameter of the medallion (default 96). */
  size?: number;
  /** Gentle shine / twinkle loop (celebration use). */
  shine?: boolean;
  style?: ViewStyle;
}

const RING: Record<BadgeTone, string> = {
  teal: "#00a294",
  purple: "#8457d2",
  yellow: "#ffc83a",
  plum: "#b8457f",
  leaf: "#79ae2d",
};

export default function BadgeMedallion({ badge, earned = true, size = 96, style }: Readonly<BadgeMedallionProps>) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={earned ? badge.name : `${badge.name} (locked)`}
      style={[
        styles.medal,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: Math.max(2, size * 0.08),
          borderColor: earned ? RING[badge.tone] : "#b9c4c2",
        },
        style,
      ]}
    >
      <Text style={{ fontSize: size * 0.42, opacity: earned ? 1 : 0.2 }}>{badge.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  medal: { backgroundColor: colors.atCream, alignItems: "center", justifyContent: "center" },
});
