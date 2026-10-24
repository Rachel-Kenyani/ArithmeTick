/**
 * A child's tile on the Profiles grid: halo, hopping avatar, name, grade chip and ★ stars.
 */

import { StyleSheet, Text, View } from "react-native";

import type { ChildProfile } from "@/types/models";
import { GRADE_META } from "@/types/domain";
import { cardShadow, colors, fonts } from "@/theme";

import type { TileState } from "../utils/gridLayout";
import HoppingAvatar from "./HoppingAvatar";
import StarsChip from "./StarsChip";
import Tile from "./Tile";

/** A brand-new explorer gets a cheerful "New" chip instead of "★ 0". */
function starLabel(n: number) {
  if (n === 0) return "new explorer";
  return `${n} ${n === 1 ? "star" : "stars"}`;
}

export default function ProfileTile({
  child,
  index,
  state,
  isChosen,
  disabled,
  reduce,
  sm,
  width,
  onPress,
}: Readonly<{
  child: ChildProfile;
  index: number;
  state: TileState;
  isChosen: boolean;
  disabled: boolean;
  reduce: boolean;
  sm: boolean;
  width: number;
  onPress: () => void;
}>) {
  const meta = GRADE_META[child.grade];
  const chipText = { fontSize: sm ? 14 : 12.5, lineHeight: sm ? 24 : 22 };
  return (
    <Tile
      index={index}
      state={state}
      reduce={reduce}
      disabled={disabled}
      onPress={onPress}
      accessibilityLabel={`${child.name}, ${meta.shortLabel}, ${starLabel(child.stars)}`}
      width={width}
      style={[
        styles.childTile,
        { minHeight: sm ? 212 : 164, paddingVertical: sm ? 16 : 12 },
      ]}
    >
      {/* halo ring (yellow when chosen) */}
      <View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            backgroundColor: isChosen
              ? "rgba(255,229,138,0.9)"
              : "rgba(255,255,255,0.35)",
          },
        ]}
      />
      <View style={styles.tileFace} />
      <HoppingAvatar
        child={child}
        size={sm ? 112 : 86}
        hop={isChosen && !reduce}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.name,
          { fontSize: sm ? 28 : 24, marginTop: sm ? 8 : 4 },
        ]}
      >
        {child.name}
      </Text>
      <View
        style={styles.chips}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={styles.gradeChip}>
          <Text style={[styles.gradeText, chipText]}>
            {meta.shortLabel}
          </Text>
        </View>
        <StarsChip stars={child.stars} chipText={chipText} />
      </View>
    </Tile>
  );
}

const styles = StyleSheet.create({
  childTile: { ...cardShadow },
  halo: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 36,
  },
  tileFace: {
    ...StyleSheet.absoluteFill,
    borderRadius: 28,
    backgroundColor: colors.jgCard,
  },
  name: {
    fontFamily: fonts.headingBold,
    color: colors.atTeal,
    lineHeight: 32,
    paddingHorizontal: 8,
    maxWidth: "100%",
  },
  chips: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  gradeChip: {
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.jgField,
  },
  gradeText: { fontFamily: fonts.bodySemiBold, color: colors.atTeal },
});
