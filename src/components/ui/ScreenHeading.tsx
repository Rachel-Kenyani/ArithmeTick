/**
 * ScreenHeading — the Quicksand title in Deep Teal ("Log In To Account") with an optional DynaPuff
 * sub-line, centred, as in every onboarding mockup.
 */

import type { ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, fonts } from "@/theme";

export interface ScreenHeadingProps {
  title: ReactNode;
  subtitle?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function ScreenHeading({ title, subtitle, style }: Readonly<ScreenHeadingProps>) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  title: { fontFamily: fonts.headingBold, fontSize: 30, lineHeight: 34, color: colors.atTeal, textAlign: "center" },
  subtitle: {
    marginTop: 6,
    maxWidth: 320,
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    lineHeight: 24,
    color: colors.jgOutline,
    textAlign: "center",
  },
});
