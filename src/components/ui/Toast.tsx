import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { AccessibilityInfo, StyleSheet, Text } from "react-native";
import Animated, { FadeOut, ReduceMotion, ZoomIn } from "react-native-reanimated";

import { CheckIcon } from "@/components/ui/icons";
import { colors, fonts } from "@/theme";

const POP_IN = ZoomIn.springify().stiffness(520).damping(28).reduceMotion(ReduceMotion.System);
const FADE_OUT = FadeOut.duration(150).reduceMotion(ReduceMotion.System);

export default function Toast({ message }: Readonly<{ message: string }>) {
  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    AccessibilityInfo.announceForAccessibility(message);
  }, [message]);
  return (
    <Animated.View
      entering={POP_IN}
      exiting={FADE_OUT}
      style={styles.toast}
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
    >
      <CheckIcon size={18} strokeWidth={3} color={colors.white} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: colors.atTeal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#00504a",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  text: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.white },
});
