/**
 * Avatar — the explorer animal heads from Figma (owl, cheetah, bear, fox), drawn from their SVGs (avatarArt.ts).
 *
 * Each head keeps its own artboard and is fitted, centred, into a `size`×`size` square, so all four line up in
 * grids and rows. Decorative unless `title` is given.
 */

import { View, type ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";

import { AVATAR_XML } from "@/components/ui/avatarArt";
import type { AvatarKind } from "@/types/models";

export interface AvatarProps {
  kind: AvatarKind;
  /** px, default 96 */
  size?: number;
  style?: ViewStyle;
  /** Accessible name; omit for decorative use (hidden from assistive tech). */
  title?: string;
}

/** The art fills this share of the square, leaving a little breathing room like the old 120 box. */
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
