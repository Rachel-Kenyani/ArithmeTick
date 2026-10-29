/** The four available explorer avatars, two big tiles per row; an avatar can be reused by different profiles. */

import { Pressable, StyleSheet, Text, View } from "react-native";

import Avatar from "@/components/ui/Avatar";
import { AVATARS, AVATAR_LABELS, type AvatarKind } from "@/types/models";
import { colors, fonts } from "@/theme";

const ROWS: readonly (readonly AvatarKind[])[] = [AVATARS.slice(0, 2), AVATARS.slice(2, 4)];

export default function AvatarPicker({ value, onChange }: Readonly<{ value: AvatarKind; onChange: (avatar: AvatarKind) => void }>) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Choose an avatar" style={styles.grid}>
      {ROWS.map((row) => (
        <View key={row.join("-")} style={styles.row}>
          {row.map((avatar) => {
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
                <Avatar kind={avatar} size={88} />
                <Text style={styles.label}>{AVATAR_LABELS[avatar]}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { alignSelf: "stretch", gap: 12 },
  row: { flexDirection: "row", gap: 12 },
  option: { flex: 1, alignItems: "center", gap: 6, borderRadius: 20, borderWidth: 3, borderColor: colors.jgField, backgroundColor: colors.white, paddingVertical: 14 },
  selected: { borderColor: colors.jgTeal, backgroundColor: colors.atMintDeep },
  label: { fontFamily: fonts.bodyBold, fontSize: 18, lineHeight: 22, color: colors.atTeal },
});
