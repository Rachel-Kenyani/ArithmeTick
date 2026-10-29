import type { RefObject } from "react";
import { StyleSheet, Text, View, type TextInputInstance } from "react-native";
import Animated, { FadeIn, FadeOut, ReduceMotion } from "react-native-reanimated";

import { CheckIcon } from "@/components/ui/icons";
import OtpInput from "@/components/ui/OtpInput";
import { colors, fonts } from "@/theme";

const MSG_IN = FadeIn.duration(150).reduceMotion(ReduceMotion.System);
const MSG_OUT = FadeOut.duration(150).reduceMotion(ReduceMotion.System);

export default function SchoolCodeBlock({
  codeRef,
  length,
  code,
  error,
  codeReady,
  onChange,
}: Readonly<{
  codeRef: RefObject<TextInputInstance | null>;
  length: number;
  code: string;
  error: string | null;
  codeReady: boolean;
  onChange: (value: string) => void;
}>) {
  return (
    <View style={styles.codeBlock}>
      <Text style={styles.question}>Do you have a school invite code?</Text>
      <OtpInput
        ref={codeRef}
        length={length}
        mode="alphanumeric"
        size="sm"
        value={code}
        onChange={onChange}
        label="School invite code (optional, 6 characters)"
        invalid={Boolean(error)}
      />
      <View accessibilityLiveRegion="polite">
        {error ? (
          <Animated.View key="code-error" entering={MSG_IN} exiting={MSG_OUT} style={styles.codeError}>
            <View style={styles.dot} />
            <Text style={styles.codeErrorText}>{error}</Text>
          </Animated.View>
        ) : null}
        {!error && codeReady ? (
          <Animated.View key="code-ok" entering={MSG_IN} exiting={MSG_OUT} style={styles.codeOk}>
            <CheckIcon size={18} strokeWidth={2.6} color={colors.atTeal} />
            <Text style={styles.codeOkText}>School code added</Text>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  codeBlock: { marginTop: 20 },
  question: { marginBottom: 12, textAlign: "center", fontFamily: fonts.bodyMedium, fontSize: 17, lineHeight: 23, color: colors.jgOutline },
  codeError: { marginTop: 8, flexDirection: "row", alignItems: "flex-start", justifyContent: "center", gap: 6, paddingHorizontal: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 8, backgroundColor: colors.atPlum },
  codeErrorText: { flexShrink: 1, textAlign: "center", fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 20, color: colors.atPlum },
  codeOk: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  codeOkText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.atTeal },
});
