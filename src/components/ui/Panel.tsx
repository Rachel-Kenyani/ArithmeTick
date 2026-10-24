/**
 * Panel — the pale-mint card every onboarding screen sits on, with the soft translucent white halo ring.
 * `variant="pill"` is the smaller rounded banner from the splash ("Welcome Explorer!").
 */

import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { cardShadow, colors } from "@/theme";

export interface PanelProps {
  variant?: "card" | "pill";
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const HALO = 8;

export default function Panel({ variant = "card", style, children }: Readonly<PanelProps>) {
  const radius = variant === "card" ? 28 : 24;
  return (
    <View style={[styles.halo, cardShadow, { borderRadius: radius + HALO }]}>
      <View style={[variant === "card" ? styles.card : styles.pill, { borderRadius: radius }, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { padding: HALO, backgroundColor: "rgba(255,255,255,0.35)" },
  card: { backgroundColor: colors.jgCard, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28 },
  pill: { backgroundColor: colors.jgCard, paddingHorizontal: 24, paddingVertical: 16, alignItems: "center" },
});
