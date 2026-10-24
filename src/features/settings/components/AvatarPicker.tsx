/** The four available explorer avatars; an avatar can be reused by different profiles. */

import { Pressable, StyleSheet, Text, View } from "react-native";

import Avatar from "@/components/ui/Avatar";
import { AVATARS, AVATAR_LABELS, type AvatarKind } from "@/types/models";
import { colors, fonts } from "@/theme";

export default function AvatarPicker({ value, onChange }: Readonly<{ value: AvatarKind; onChange: (avatar: AvatarKind) => void }>) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Choose an avatar" style={styles.row}>
      {AVATARS.map((avatar) => {
        const selected = avatar === value;
        return (
          <Pressable
            key={avatar}
            onPress={() => onChange(avatar)}
            accessibilityRole="radio"
            accessibilityLabel={AVATAR_LABELS[avatar]}
            accessibilityState={{ selected }}
            style={[styles.option, selected && styles.selected]}
          >
            <Avatar kind={avatar} size={54} />
            <Text style={styles.label}>{AVATAR_LABELS[avatar]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  option: { width: 74, alignItems: "center", borderRadius: 16, borderWidth: 2, borderColor: colors.jgField, backgroundColor: colors.white, paddingVertical: 6 },
  selected: { borderColor: colors.jgTeal, backgroundColor: colors.atMintDeep },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 11, lineHeight: 14, color: colors.atTeal },
});
