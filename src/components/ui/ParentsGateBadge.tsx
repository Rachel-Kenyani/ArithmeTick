import { StyleSheet, Text, View } from "react-native";

import { GROWN_UP } from "@/components/ui/GrownUpNote";
import { ShieldCheckIcon } from "@/components/ui/icons";
import { fonts } from "@/theme";

/** Tells a grown-up they are past the 2-second hold, on pages only grown-ups can open. */
export default function ParentsGateBadge() {
  return (
    <View style={styles.badge} accessible accessibilityLabel="Parents gate. Only grown-ups can open this page.">
      <ShieldCheckIcon size={16} strokeWidth={2.4} color={GROWN_UP.ink} />
      <Text style={styles.label}>PARENTS GATE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: GROWN_UP.bg,
    borderWidth: 2,
    borderColor: GROWN_UP.border,
  },
  label: { fontFamily: fonts.textBold, fontSize: 12, lineHeight: 16, letterSpacing: 1, color: GROWN_UP.ink },
});
