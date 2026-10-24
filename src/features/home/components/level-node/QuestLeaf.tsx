/** The leaf sprouting from a quest stop's corner. */

import { StyleSheet, View } from "react-native";

import { LeafIcon } from "@/components/ui/icons";
import type { LevelNodeProps } from "@/features/home/components/level-node/types";

/** Quest leaf ornament on the coin's inner side. */
export default function QuestLeaf({ side, big, dimmed }: Readonly<{ side: LevelNodeProps["side"]; big: boolean; dimmed: boolean }>) {
  return (
    <View
      style={[
        styles.leaf,
        side === "left"
          ? { right: -12, transform: [{ rotate: "6deg" }] }
          : { left: -12, transform: [{ scaleX: -1 }, { rotate: "-6deg" }] },
        dimmed && { opacity: 0.6 },
      ]}
    >
      <LeafIcon size={big ? 30 : 26} fill="#86c232" stroke="#1b1b1b" strokeWidth={1.9} />
    </View>
  );
}

const styles = StyleSheet.create({
  leaf: { position: "absolute", top: -12 },
});
