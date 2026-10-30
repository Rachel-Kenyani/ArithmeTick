/**
 * Brijo public contract — mood names and component props.
 */

import type { ViewStyle } from "react-native";

/* ------------------------------------------------------------------------------------------
 * Public contract
 * ---------------------------------------------------------------------------------------- */

export type BrijoMood = "idle" | "wave" | "talk" | "dance" | "cheer" | "sleep";

export interface BrijoMascotProps {
  /** What Brijo is doing. Every mood loops gently. Default `"idle"`. */
  mood?: BrijoMood;
  /** Rendered width and height in px. Default 96. */
  size?: number;
  style?: ViewStyle;
}
