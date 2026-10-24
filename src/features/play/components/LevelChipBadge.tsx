/**
 * LevelChipBadge — the level chip's leading badge on wide screens.
 */

import { StyleSheet, View } from "react-native";

import JaymoMascot from "@/components/mascot/JaymoMascot";
import { LeafIcon } from "@/components/ui/icons";
import { colors } from "@/theme";

/** Leaf badge for quests, a peeking Jaymo otherwise (wide screens only). */
export default function LevelChipBadge({ isQuest }: Readonly<{ isQuest: boolean }>) {
  if (isQuest) {
    return (
      <View style={styles.leafBadge}>
        <LeafIcon size={22} strokeWidth={2.4} color={colors.white} />
      </View>
    );
  }
  return (
    <View pointerEvents="none" style={styles.chipJaymo}>
      <JaymoMascot mood="idle" size={52} />
    </View>
  );
}

const styles = StyleSheet.create({
  leafBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#79ae2d",
    borderWidth: 2,
    borderColor: "rgba(76,119,24,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  chipJaymo: { position: "absolute", top: -4, left: 4 },
});
