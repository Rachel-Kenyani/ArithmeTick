/**
 * The dashed "Add Profile" tile at the end of the Profiles grid.
 */

import { StyleSheet, Text } from "react-native";

import { PlusIcon } from "@/components/ui/icons";
import { colors, fonts } from "@/theme";

import type { TileState } from "../utils/gridLayout";
import Tile from "./Tile";

/** The dashed "Add Profile" tile at the end of the grid. */
export default function AddProfileTile({
  sm,
  ...tile
}: Readonly<{
  index: number;
  state: TileState;
  reduce: boolean;
  disabled: boolean;
  onPress: () => void;
  width: number;
  sm: boolean;
}>) {
  return (
    <Tile
      {...tile}
      accessibilityLabel="Add Profile"
      style={[styles.addTile, { minHeight: sm ? 212 : 164, gap: sm ? 10 : 6 }]}
    >
      <PlusIcon size={sm ? 76 : 64} strokeWidth={2.3} color={colors.atTeal} />
      <Text style={[styles.addText, { fontSize: sm ? 24 : 22 }]}>
        Add Profile
      </Text>
    </Tile>
  );
}

const styles = StyleSheet.create({
  addTile: {
    borderWidth: 4,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.95)",
    backgroundColor: "rgba(234,248,245,0.85)",
    paddingVertical: 12,
    shadowColor: "#003c5a",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 18 },
    elevation: 6,
  },
  addText: {
    fontFamily: fonts.headingBold,
    color: colors.jgOutline,
    lineHeight: 28,
  },
});
