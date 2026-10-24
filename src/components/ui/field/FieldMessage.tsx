/**
 * Error / hint line shown under a form field.
 */

import { useEffect, type ReactNode } from "react";
import { AccessibilityInfo, StyleSheet, Text, View } from "react-native";

import { AlertCircleIcon } from "@/components/ui/icons";
import { colors, fonts } from "@/theme";

/**
 * Friendly message / hint line under a field. An error gets an alert icon (so it isn't told by colour alone) and is
 * announced to screen readers when it appears or changes (live region on Android, an announcement on iOS).
 */
export function FieldMessage({
  error,
  hint,
}: Readonly<{ error?: string | null; hint?: ReactNode }>) {
  useEffect(() => {
    if (error) AccessibilityInfo.announceForAccessibility(error);
  }, [error]);
  if (error) {
    return (
      <View
        style={styles.msgRow}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
      >
        <AlertCircleIcon
          size={18}
          strokeWidth={2.4}
          color={colors.atPlum}
          style={styles.msgIcon}
        />
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }
  return hint ? <Text style={styles.hint}>{hint}</Text> : null;
}

const styles = StyleSheet.create({
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 8,
  },
  msgIcon: { marginTop: 1 },
  error: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.atPlum,
  },
  hint: {
    marginTop: 6,
    paddingHorizontal: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 19,
    color: "rgba(0,0,0,0.6)",
  },
});
