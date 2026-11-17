import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GROWN_UP } from "@/components/ui/GrownUpNote";
import { ChevronRightIcon } from "@/components/ui/icons";
import { sfx } from "@/services/audio";
import { colors, fonts } from "@/theme";

/**
 * A group of settings rows in one rounded box with thin dividers, an uppercase heading above and an optional note
 * below, like the grouped lists in phone settings.
 */
export function SettingsGroup({ title, note, children }: Readonly<{ title?: string; note?: string; children: ReactNode }>) {
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View style={styles.group}>
      {title ? (
        <Text style={styles.heading} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      <View style={styles.box}>
        {rows.map((row, i) => (
          <Fragment key={row.key ?? i}>
            {i > 0 ? <View style={styles.divider} /> : null}
            {row}
          </Fragment>
        ))}
      </View>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

export interface SettingsRowProps {
  label: string;
  icon?: ReactNode;
  /** Shown on the right in lighter text, like "Grade 1". */
  value?: string;
  /** A control on the right, such as a switch. Replaces the arrow. */
  trailing?: ReactNode;
  /** Shows an arrow, for rows that open another screen. */
  opens?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  /** A line under the label saying what the row does. */
  hint?: string;
  /** `danger` is for actions that can't be undone, like deleting the account. */
  tone?: "grownUp" | "danger";
}

export function SettingsRow({ label, icon, value, trailing, opens = false, onPress, disabled = false, hint, tone = "grownUp" }: Readonly<SettingsRowProps>) {
  const ink = tone === "danger" ? colors.danger : GROWN_UP.ink;
  const content = (
    <>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <View style={styles.text}>
        <Text style={[styles.label, { color: ink }]} numberOfLines={1}>
          {label}
        </Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {trailing ?? (opens ? <ChevronRightIcon size={20} strokeWidth={2.4} color={ink} /> : null)}
    </>
  );
  if (!onPress) {
    return (
      <View style={styles.row} accessible accessibilityLabel={value ? `${label}, ${value}` : label}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={() => {
        sfx.click();
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && styles.disabled]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  heading: { fontFamily: fonts.textBold, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: GROWN_UP.ink, paddingHorizontal: 6 },
  box: { borderRadius: 18, backgroundColor: colors.white, borderWidth: 2, borderColor: GROWN_UP.border, overflow: "hidden" },
  divider: { height: 1, marginLeft: 58, backgroundColor: GROWN_UP.border },
  row: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 10 },
  pressed: { backgroundColor: GROWN_UP.bg },
  disabled: { opacity: 0.5 },
  icon: { width: 32, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, gap: 2 },
  label: { fontFamily: fonts.textBold, fontSize: 17, color: GROWN_UP.ink },
  hint: { fontFamily: fonts.textSemiBold, fontSize: 14, lineHeight: 19, color: colors.muted },
  value: { fontFamily: fonts.textSemiBold, fontSize: 15, color: colors.muted },
  note: { fontFamily: fonts.textSemiBold, fontSize: 14, lineHeight: 19, color: colors.muted, paddingHorizontal: 6 },
});
