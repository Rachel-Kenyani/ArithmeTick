// TEMPORARY stand-in — replaced when Grade3ArrayMultiplication is ported (see README).

import { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";

import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import { sfx } from "@/services/audio";
import type { ArrayProps } from "@/types/domain";
import { colors, fonts } from "@/theme";

export default function Grade3ArrayMultiplication({ level, rows = 3, cols = 4, palActive, onStruggle, onSolved }: Readonly<ArrayProps>) {
  const solvedRef = useRef(false);
  const solve = () => {
    if (solvedRef.current) return;
    solvedRef.current = true;
    sfx.solved();
    onSolved();
  };

  return (
    <View style={styles.wrap}>
      <Panel style={styles.panel}>
        {palActive ? (
          <View style={styles.chip}>
            <Text style={styles.chipText}>Help is on</Text>
          </View>
        ) : null}
        <Text style={styles.title}>{`Build ${rows} × ${cols} — board coming soon`}</Text>
        {level ? <Text style={styles.sub}>Level {level}</Text> : null}
        <Button onPress={solve}>Solve</Button>
        <Button variant="white" onPress={onStruggle}>
          I&apos;m stuck
        </Button>
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  panel: { gap: 14, alignItems: "stretch", minWidth: 260 },
  chip: { alignSelf: "center", backgroundColor: colors.atGlow, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  chipText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.atInk },
  title: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.atTeal, textAlign: "center" },
  sub: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.atInk, textAlign: "center" },
});
