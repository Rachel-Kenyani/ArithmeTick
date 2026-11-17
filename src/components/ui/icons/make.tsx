import type { ReactNode } from "react";
import { Platform, type ColorValue, type ViewStyle } from "react-native";
import Svg from "react-native-svg";

import { colors } from "@/theme";

export interface IconProps {
  size?: number;
  title?: string;
  color?: ColorValue;
  fill?: ColorValue;
  stroke?: ColorValue;
  strokeWidth?: number;
  style?: ViewStyle;
}

/** Props that hide decorative SVG from screen readers. On the web they become `aria-hidden`, since the DOM has no native props. */
export const SVG_HIDDEN =
  Platform.OS === "web"
    ? ({ "aria-hidden": true } as const)
    : ({ accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" } as const);

export function a11y(title?: string) {
  if (title) return { accessible: true, accessibilityRole: "image", accessibilityLabel: title } as const;
  if (Platform.OS === "web") return SVG_HIDDEN;
  return { accessible: false, ...SVG_HIDDEN } as const;
}

export function make(displayName: string, glyph: ReactNode) {
  function Icon({
    size = 24,
    title,
    color = colors.jgOutline,
    fill = "none",
    stroke = "currentColor",
    strokeWidth = 2,
    style,
  }: Readonly<IconProps>) {
    return (
      <Svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        color={color}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
        {...a11y(title)}
      >
        {glyph}
      </Svg>
    );
  }
  Icon.displayName = displayName;
  return Icon;
}
