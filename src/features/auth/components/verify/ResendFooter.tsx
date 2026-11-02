import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { colors, fonts } from "@/theme";

export default function ResendFooter({
  resendStyle,
  onResend,
  disabled,
}: Readonly<{
  resendStyle: ComponentProps<typeof Animated.View>["style"];
  onResend: () => void;
  disabled: boolean;
}>) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>Didn’t Get The Code? </Text>
      <Animated.View style={resendStyle}>
        <Pressable
          onPress={onResend}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          accessibilityHint={disabled ? "Available when the timer ends" : undefined}
          style={styles.footerLink}
        >
          {({ pressed }) => (
            <Text
              style={[
                styles.footerText,
                disabled ? styles.linkMuted : styles.link,
                pressed && !disabled && styles.linkPressed,
              ]}
            >
              Resend Code
            </Text>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    lineHeight: 24,
    color: colors.jgOutline,
    textAlign: "center",
  },
  footerLink: { paddingVertical: 12, marginVertical: -6, paddingHorizontal: 2 },
  link: { color: colors.jgPurple },
  linkMuted: { color: "#6B7F7D" },
  linkPressed: { color: "#6a3db8", textDecorationLine: "underline" },
});
