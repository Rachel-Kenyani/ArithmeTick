/**
 * Panel — the pale-mint card every onboarding screen sits on, with the soft translucent white halo ring.
 * `variant="pill"` is the smaller rounded banner from the splash ("Welcome Explorer!").
 */

import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { cardShadow, colors } from "@/theme";

export interface PanelProps {
  variant?: "card" | "pill";
  /** Set false where a single clean card is clearer than the decorative outer halo. */
  halo?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const HALO = 8;

export default function Panel({ variant = "card", halo = true, style, children }: Readonly<PanelProps>) {
  const radius = variant === "card" ? 28 : 24;
  const card = <View style={[variant === "card" ? styles.card : styles.pill, { borderRadius: radius }, style]}>{children}</View>;
  if (!halo) return <View style={[cardShadow, { borderRadius: radius }]}>{card}</View>;
  return (
    <View style={[styles.halo, cardShadow, { borderRadius: radius + HALO }]}>
      {card}
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { padding: HALO, backgroundColor: "rgba(255,255,255,0.35)" },
  card: { backgroundColor: colors.jgCard, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28 },
  pill: { backgroundColor: colors.jgCard, paddingHorizontal: 24, paddingVertical: 16, alignItems: "center" },
});
