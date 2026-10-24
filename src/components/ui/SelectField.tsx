/**
 * A select that looks exactly like TextField ("Choose their Grade / Class"): purple icon, the chosen
 * label (or placeholder), teal chevron. Tapping opens a bottom sheet of big, kid-proof options.
 */

import { useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CheckIcon, ChevronDownIcon } from "@/components/ui/icons";
import { FieldMessage, fieldStyles, PLACEHOLDER_COLOR } from "@/components/ui/TextField";
import { sfx } from "@/services/audio";
import { colors, fonts } from "@/theme";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  placeholder: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  icon?: ReactNode;
  error?: string | null;
  style?: StyleProp<ViewStyle>;
}

export default function SelectField({ label, placeholder, value, options, onChange, icon, error, style }: Readonly<SelectFieldProps>) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const chosen = options.find((o) => o.value === value) ?? null;

  return (
    <View style={style}>
      <Pressable
        onPress={() => {
          sfx.click();
          setOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${chosen ? chosen.label : "not chosen"}`}
        style={[fieldStyles.face, styles.face, error ? fieldStyles.error : null]}
      >
        {icon}
        <Text numberOfLines={1} ellipsizeMode="tail" style={[fieldStyles.text, styles.value, !chosen && { color: PLACEHOLDER_COLOR }]}>
          {chosen ? chosen.label : placeholder}
        </Text>
        <View style={styles.chevron}>
          <ChevronDownIcon size={24} strokeWidth={2.2} color={colors.atTeal} />
        </View>
      </Pressable>
      <FieldMessage error={error} />

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.scrim} onPress={() => setOpen(false)} accessibilityLabel="Close" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.sheetTitle}>{label}</Text>
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <Pressable
                key={o.value}
                onPress={() => {
                  sfx.click();
                  onChange(o.value);
                  setOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [styles.option, selected && styles.optionOn, pressed && styles.optionPressed]}
              >
                <Text style={[styles.optionText, selected && { color: colors.atTeal }]}>{o.label}</Text>
                {selected ? <CheckIcon size={22} strokeWidth={2.6} color={colors.atTeal} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  face: { paddingVertical: 6 },
  value: { flex: 1, minWidth: 0, lineHeight: 23 },
  chevron: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  scrim: { flex: 1, backgroundColor: "rgba(0,40,40,0.35)" },
  sheet: { backgroundColor: colors.jgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 20, gap: 10 },
  sheetTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.atTeal, textAlign: "center", marginBottom: 6 },
  option: {
    minHeight: 60,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.jgField,
    backgroundColor: colors.white,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionOn: { borderColor: colors.jgTeal },
  optionPressed: { backgroundColor: colors.atMint },
  optionText: { fontFamily: fonts.headingBold, fontSize: 18, color: "#141414", flexShrink: 1 },
});
