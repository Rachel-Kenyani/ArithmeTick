import { View, type ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";

import { AVATAR_XML } from "@/components/ui/avatarArt";
import type { AvatarKind } from "@/types/models";

export interface AvatarProps {
  kind: AvatarKind;
  size?: number;
  style?: ViewStyle;
  title?: string;
}

const ART_SCALE = 0.92;

export default function Avatar({ kind, size = 96, style, title }: Readonly<AvatarProps>) {
  const xml = AVATAR_XML[kind] ?? AVATAR_XML.owl;
  const art = size * ART_SCALE;
  return (
    <View
      style={[{ width: size, height: size, flexShrink: 0, alignItems: "center", justifyContent: "center" }, style]}
      {...(title
        ? { accessible: true, accessibilityRole: "image" as const, accessibilityLabel: title }
        : {
            accessible: false,
            accessibilityElementsHidden: true,
            importantForAccessibility: "no-hide-descendants" as const,
          })}
    >
      <SvgXml xml={xml} width={art} height={art} />
    </View>
  );
}
