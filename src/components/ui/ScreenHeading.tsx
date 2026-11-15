import type { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors, fonts } from "@/theme";

export interface ScreenHeadingProps {
  title: ReactNode;
  subtitle?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function ScreenHeading({
  title,
  subtitle,
  style,
}: Readonly<ScreenHeadingProps>) {
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
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    lineHeight: 36,
    color: colors.atTeal,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    maxWidth: 360,
    fontFamily: fonts.textSemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.jgOutline,
    textAlign: "center",
  },
});
