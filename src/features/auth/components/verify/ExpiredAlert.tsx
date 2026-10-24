/**
 * Inline "This code has expired" alert that replaces the Verify countdown at 00:00.
 */

import { StyleSheet, Text, View } from "react-native";

import { AlertCircleIcon } from "@/components/ui/icons";
import { colors, fonts } from "@/theme";

export default function ExpiredAlert() {
  return (
    <View style={styles.expired} accessibilityRole="alert">
      <View style={styles.row}>
        <AlertCircleIcon
          size={20}
          strokeWidth={2.4}
          color={colors.atPlum}
        />
        <Text style={styles.expiredText}>
          This code has expired. Tap Resend Code
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  expired: {
    alignItems: "center",
    gap: 2,
    borderRadius: 16,
    backgroundColor: "rgba(168,50,110,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  expiredText: {
    fontFamily: fonts.headingBold,
    fontSize: 17,
    color: colors.atPlum,
  },
});
