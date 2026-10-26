// TEMPORARY stand-in — replaced when PhysicalQuestOverlay is ported (see README).

import { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";

import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import type { Grade } from "@/types/domain";
import { colors, fonts } from "@/theme";

export interface PhysicalQuestOverlayProps {
  grade: Grade;
  onConfirmed(): void;
}

/** Tiny grade-flavoured example split (same as web). */
const HINTS: Record<Grade, string> = { 1: "7 + 3", 2: "8 + 2", 3: "5 + 5" };

export default function PhysicalQuestOverlay({ grade, onConfirmed }: Readonly<PhysicalQuestOverlayProps>) {
  const doneRef = useRef(false);
  const confirm = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onConfirmed();
  };
  return (
    <View style={styles.wrap}>
      <Panel style={styles.panel}>
        <Text style={styles.title}>Move &amp; Play</Text>
        <Text style={styles.copy}>Show a grown-up 2 groups that make 10.</Text>
        <Text style={styles.hint}>e.g. {HINTS[grade]}</Text>
        <Button variant="purple" onPress={confirm}>
          Grown-up: tap when done
        </Button>
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  panel: { gap: 12, minWidth: 260, maxWidth: 420 },
  title: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.atTeal, textAlign: "center" },
  copy: { fontFamily: fonts.bodyMedium, fontSize: 18, color: colors.jgOutline, textAlign: "center" },
  hint: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.atPurple, textAlign: "center" },
});
