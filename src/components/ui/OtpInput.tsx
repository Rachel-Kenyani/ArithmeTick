/**
 * One-box-per-character code entry ("Verify Account", school invite code).
 *
 *   <OtpInput length={5} value={code} onChange={setCode} onComplete={verify} label="5-digit verification code" autoFocus />
 *   <OtpInput length={6} mode="alphanumeric" size="sm" value={school} onChange={setSchool} label="School invite code" />
 *
 * Native pattern: one invisible TextInput stretched over the drawn boxes holds the whole code, so typing,
 * backspace, paste and SMS autofill (iOS oneTimeCode / Android sms-otp) all just work. Tapping any box
 * focuses it; the next empty box shows the "you are here" border.
 * `onComplete` fires once each time the code becomes complete (never twice for the same code).
 */

import { useEffect, useRef, useState, type Ref } from "react";
import { StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle, type TextInputInstance } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

import { colors, fonts } from "@/theme";

export interface OtpInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  label: string;
  mode?: "numeric" | "alphanumeric";
  autoFocus?: boolean;
  invalid?: boolean;
  onComplete?: (value: string) => void;
  size?: "md" | "sm";
  style?: StyleProp<ViewStyle>;
  /** The hidden input that holds the code — call .focus() to bring up the keyboard on the next empty box. */
  ref?: Ref<TextInputInstance>;
}

const SIZES = {
  md: { box: 56, gap: 12, font: 26 },
  sm: { box: 46, gap: 8, font: 22 },
} as const;

function sanitize(raw: string, mode: "numeric" | "alphanumeric") {
  return mode === "numeric" ? raw.replace(/\D/g, "") : raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function Box({ ch, active, invalid, size }: Readonly<{ ch: string; active: boolean; invalid?: boolean; size: { box: number; gap: number; font: number } }>) {
  const reduce = useReducedMotion();
  const scale = useSharedValue(1);
  useEffect(() => {
    if (ch && !reduce) scale.set(withSequence(withTiming(1.1, { duration: 110 }), withTiming(1, { duration: 110 })));
  }, [ch, reduce, scale]);
  const pop = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View
      style={[
        styles.box,
        { width: size.box, height: size.box },
        boxStateStyle(Boolean(invalid), Boolean(ch), active),
        pop,
      ]}
    >
      <Text style={[styles.char, { fontSize: size.font }]}>{ch}</Text>
    </Animated.View>
  );
}

export default function OtpInput({
  length,
  value,
  onChange,
  label,
  mode = "numeric",
  autoFocus,
  invalid,
  onComplete,
  size = "md",
  style,
  ref,
}: Readonly<OtpInputProps>) {
  const shown = sanitize(value, mode).slice(0, length);
  const lastCompleted = useRef<string | null>(null);
  const [focused, setFocused] = useState(false);
  const dim = SIZES[size];

  useEffect(() => {
    if (shown.length < length) lastCompleted.current = null;
  }, [shown, length]);

  const handleChange = (raw: string) => {
    const clean = sanitize(raw, mode).slice(0, length);
    if (clean !== shown) onChange(clean);
    if (clean.length === length && lastCompleted.current !== clean) {
      lastCompleted.current = clean;
      onComplete?.(clean);
    }
  };

  return (
    <View style={[styles.row, { gap: dim.gap }, style]}>
      {Array.from({ length }, (_, i) => (
        <Box key={i} ch={shown[i] ?? ""} active={focused && i === Math.min(shown.length, length - 1)} invalid={invalid} size={dim} />
      ))}
      <TextInput
        ref={ref}
        value={shown}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={length}
        autoFocus={autoFocus}
        accessibilityLabel={label}
        keyboardType={mode === "numeric" ? "number-pad" : "default"}
        autoCapitalize={mode === "alphanumeric" ? "characters" : "none"}
        autoCorrect={false}
        spellCheck={false}
        textContentType={mode === "numeric" ? "oneTimeCode" : "none"}
        autoComplete={mode === "numeric" ? "sms-otp" : "off"}
        caretHidden
        contextMenuHidden={false}
        style={styles.hidden}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "center", alignSelf: "stretch" },
  box: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(0,79,74,0.8)",
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  filled: { borderColor: colors.atTeal },
  active: { borderColor: colors.jgTeal, borderWidth: 3 },
  invalid: { borderColor: colors.atPlum, backgroundColor: "rgba(168,50,110,0.04)" },
  char: { fontFamily: fonts.bodySemiBold, color: colors.atInk },
  // Covers the boxes so a tap anywhere focuses it; transparent text so only the boxes show.
  hidden: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, color: "transparent", backgroundColor: "transparent", fontSize: 1 },
});

function boxStateStyle(invalid: boolean, filled: boolean, active: boolean) {
  if (invalid) return styles.invalid;
  if (filled) return styles.filled;
  return active ? styles.active : null;
}
