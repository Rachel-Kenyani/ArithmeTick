/**
 * Grown-up voice: anything addressed to a parent / tutor (not the child) is plum text on a light plum
 * panel with an "i" badge, so the child learns it isn't for them and the grown-up spots it at a glance.
 *
 *   <GrownUpNote>Hold the button once they show you.</GrownUpNote>
 */

import type { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { colors, fonts } from "@/theme";

export const GROWN_UP = {
  ink: colors.atPlum,
  bg: "#fbe9f2",
  border: "#e7b3cd",
  fill: "rgba(168,50,110,0.22)",
} as const;

/** A plum "i" in a ring. */
export function InfoIcon({
  size = 20,
  color = GROWN_UP.ink,
}: Readonly<{ size?: number; color?: string }>) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Circle
        cx={12}
        cy={12}
        r={10}
        fill={colors.white}
        stroke={color}
        strokeWidth={2.2}
      />
      <Circle cx={12} cy={7.6} r={1.5} fill={color} />
      <Path
        d="M12 11v6.2"
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function GrownUpNote({
  children,
  style,
}: Readonly<{ children: ReactNode; style?: StyleProp<ViewStyle> }>) {
  return (
    <View style={[styles.note, style]} accessibilityRole="text">
      {typeof children === "string" ? (
        <Text style={styles.text}>{children}</Text>
      ) : (
        <View style={styles.body}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  text: {
    flex: 1,
    fontFamily: fonts.headingSemiBold,
    fontSize: 20,
    textAlign: "center",
  },
  body: { flex: 1 },
});
