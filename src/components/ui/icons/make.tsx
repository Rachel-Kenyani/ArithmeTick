/**
 * Icon factory — shared props, a11y helper and the `make` wrapper every outline icon uses.
 */

import type { ReactNode } from "react";
import type { ColorValue, ViewStyle } from "react-native";
import Svg from "react-native-svg";

import { colors } from "@/theme";

export interface IconProps {
  /** px; default 24 */
  size?: number;
  /** When set, the icon is announced (accessible image); otherwise hidden from assistive tech. */
  title?: string;
  /** Tint; what "currentColor" resolves to. Default colors.jgOutline. */
  color?: ColorValue;
  /** Default "none". Pass "currentColor" for the solid variant. */
  fill?: ColorValue;
  /** Default "currentColor". */
  stroke?: ColorValue;
  /** Default 2. */
  strokeWidth?: number;
  style?: ViewStyle;
}

export function a11y(title?: string) {
  return title
    ? ({ accessible: true, accessibilityRole: "image", accessibilityLabel: title } as const)
    : ({
        accessible: false,
        accessibilityElementsHidden: true,
        importantForAccessibility: "no-hide-descendants",
      } as const);
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
