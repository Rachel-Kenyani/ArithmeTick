import { StyleSheet, Text, View, type TextInputFocusEvent } from "react-native";

import { TextField, type TextFieldProps } from "@/components/ui/TextField";
import { MailIcon } from "@/components/ui/icons";
import { colors, fonts } from "@/theme";
import { normalizePhone } from "@/utils/validate";

export const looksLikePhone = (raw: string) => /^[\d+(]/.test(raw.trim()) && !raw.includes("@");

function localPart(e164: string): string {
  const digits = e164.slice(4);
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export default function IdentifierField({
  value,
  onChangeText,
  onBlur,
  ...props
}: Readonly<Omit<TextFieldProps, "label" | "icon" | "placeholder">>) {
  const phone = looksLikePhone(value ?? "");

  const handleBlur = (e: TextInputFocusEvent) => {
    const e164 = phone ? normalizePhone(value ?? "") : null;
    if (e164) onChangeText?.(localPart(e164));
    onBlur?.(e);
  };

  return (
    <TextField
      {...props}
      label={phone ? "Kenyan phone number, starting with +254" : "Email or phone number"}
      icon={
        phone ? (
          <View style={styles.chip} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Text style={styles.chipText}>🇰🇪 +254</Text>
          </View>
        ) : (
          <MailIcon color={colors.atPurple} />
        )
      }
      placeholder="Email or phone (07…)"
      value={value}
      onChangeText={onChangeText}
      onBlur={handleBlur}
    />
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: 10, backgroundColor: colors.atMintDeep, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { fontFamily: fonts.headingBold, fontSize: 15, fontVariant: ["tabular-nums"] },
});
