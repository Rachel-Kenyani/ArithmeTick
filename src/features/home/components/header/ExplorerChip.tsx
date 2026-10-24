/** The explorer switcher chip: avatar + name + ⌄ (opens /profiles). */

import { Pressable, StyleSheet, Text, View } from "react-native";

import Avatar from "@/components/ui/Avatar";
import { ChevronDownIcon } from "@/components/ui/icons";
import { CHIP_EDGE } from "@/features/home/components/header/constants";
import type { ChildProfile } from "@/types/models";
import { colors, fonts } from "@/theme";

export default function ExplorerChip({ profile, onPress }: Readonly<{ profile: ChildProfile; onPress: () => void }>) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Playing as ${profile.name}`}
      accessibilityHint="Opens the explorer list to switch who is playing"
      style={({ pressed }) => [
        styles.chip,
        pressed && { transform: [{ translateY: 3 }], shadowOffset: { width: 0, height: 1 }, backgroundColor: colors.white },
      ]}
    >
      <View style={styles.avatarWrap}>
        <Avatar kind={profile.avatar} size={40} />
      </View>
      <Text numberOfLines={1} style={styles.name}>
        {profile.name}
      </Text>
      {/* The chevron says the chip opens something (the explorer list), so it doesn't read as a plain label */}
      <ChevronDownIcon size={22} strokeWidth={3} color={colors.atPurple} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 52,
    minWidth: 0,
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    shadowColor: CHIP_EDGE,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.jgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { flexShrink: 1, fontFamily: fonts.headingBold, fontSize: 20, lineHeight: 24, color: colors.atTeal },
});
