import { type BlurEvent } from "react-native";
// PHONE: import { StyleSheet, Text, View, type BlurEvent } from "react-native";

import { TextField, type TextFieldProps } from "@/components/ui/TextField";
import { MailIcon } from "@/components/ui/icons";
import { colors } from "@/theme";
// PHONE: import { colors, fonts } from "@/theme";
// PHONE: import { normalizePhone } from "@/features/auth/utils/validate";

// PHONE: export const looksLikePhone = (raw: string) => /^[\d+(]/.test(raw.trim()) && !raw.includes("@");

// PHONE: function localPart(e164: string): string {
// PHONE:   const digits = e164.slice(4);
// PHONE:   return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
// PHONE: }

/** Phone sign-in is switched off until codes can reach every parent (a WhatsApp or transactional SMS sender). To bring it back, restore the commented-out lines marked PHONE. */
export default function IdentifierField({
  value,
  onChangeText,
  onBlur,
  ...props
}: Readonly<Omit<TextFieldProps, "label" | "icon" | "placeholder">>) {
  // PHONE: const phone = looksLikePhone(value ?? "");

  const handleBlur = (e: BlurEvent) => {
    // PHONE: const e164 = phone ? normalizePhone(value ?? "") : null;
    // PHONE: if (e164) onChangeText?.(localPart(e164));
    onBlur?.(e);
  };

  return (
    <TextField
      {...props}
      label="Email address"
      // PHONE: label={phone ? "Kenyan phone number, starting with +254" : "Email or phone number"}
      icon={<MailIcon color={colors.atPurple} />}
      // PHONE: icon={
      // PHONE:   phone ? (
      // PHONE:     <View style={styles.chip} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      // PHONE:       <Text style={styles.chipText}>+254</Text>
      // PHONE:     </View>
      // PHONE:   ) : (
      // PHONE:     <MailIcon color={colors.atPurple} />
      // PHONE:   )
      // PHONE: }
      placeholder="Enter your Email Address"
      // PHONE: placeholder="Email or phone (07…)"
      value={value}
      onChangeText={onChangeText}
      onBlur={handleBlur}
    />
  );
}

// PHONE: const styles = StyleSheet.create({
// PHONE:   chip: { borderRadius: 10, backgroundColor: colors.atMintDeep, paddingHorizontal: 8, paddingVertical: 4 },
// PHONE:   chipText: { fontFamily: fonts.textBold, fontSize: 15, fontVariant: ["tabular-nums"] },
// PHONE: });
