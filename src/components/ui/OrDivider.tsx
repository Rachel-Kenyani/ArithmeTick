/** Thin teal rules with a word in the middle — "Continue with Google ── or ── email". */

import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, fonts } from "@/theme";

export default function OrDivider({ label = "or", style }: Readonly<{ label?: string; style?: StyleProp<ViewStyle> }>) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.rule} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 16, alignSelf: "stretch" },
  rule: { flex: 1, height: 1.5, borderRadius: 1, backgroundColor: "rgba(0,150,138,0.7)" },
  label: { fontFamily: fonts.bodyMedium, fontSize: 18, color: colors.atTeal },
});
