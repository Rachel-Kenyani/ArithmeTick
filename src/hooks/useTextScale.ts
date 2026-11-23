import { StyleSheet, type StyleProp, type TextStyle } from "react-native";

import { useActiveProfile } from "@/state/store";

/** How much larger reading text is drawn for a child with Larger text on. */
export const LARGE_TEXT_SCALE = 1.25;

/** 1 normally, LARGE_TEXT_SCALE when the playing child has Larger text on. */
export function useTextScale(): number {
  return useActiveProfile()?.largeText ? LARGE_TEXT_SCALE : 1;
}

/** The style with its font size and line height multiplied by `scale`. Unchanged at 1. */
export function scaleText(style: StyleProp<TextStyle>, scale: number): StyleProp<TextStyle> {
  if (scale === 1) return style;
  const flat = StyleSheet.flatten(style) ?? {};
  return [
    style,
    {
      ...(typeof flat.fontSize === "number" ? { fontSize: Math.round(flat.fontSize * scale) } : {}),
      ...(typeof flat.lineHeight === "number" ? { lineHeight: Math.round(flat.lineHeight * scale) } : {}),
    },
  ];
}
