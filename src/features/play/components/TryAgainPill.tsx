import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ReplayIcon } from "@/components/ui/icons";
import { answerAnnouncement } from "@/services/a11y";
import { colors, fonts } from "@/theme";

/** How long the message stays after a wrong answer. */
export const TRY_AGAIN_MS = 2200;

/**
 * Shows "Not quite. Have another go." with a try-again arrow after a wrong answer, so the answer being wrong is never
 * shown by sound or colour alone. Screen readers already hear it from the play session, so it is hidden from them here.
 * Give it a new `key` for each wrong answer.
 */
export default function TryAgainPill({ reduced }: Readonly<{ reduced: boolean }>) {
  const [shown, setShown] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShown(false), TRY_AGAIN_MS);
    return () => clearTimeout(timer);
  }, []);
  if (!shown) return null;
  return (
    <Animated.View
      pointerEvents="none"
      entering={reduced ? undefined : FadeIn.duration(160)}
      exiting={reduced ? undefined : FadeOut.duration(200)}
      style={styles.pill}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <ReplayIcon size={20} strokeWidth={2.6} color={colors.atInk} />
      <Text style={styles.text}>{answerAnnouncement(false, 0)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    top: 24,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.atInk,
    backgroundColor: colors.atCream,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: "#00504a",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  text: { fontFamily: fonts.textBold, fontSize: 17, color: colors.atInk },
});
