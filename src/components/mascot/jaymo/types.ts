/**
 * Jaymo public contract — mood names and component props.
 */

import type { ViewStyle } from "react-native";

/* ------------------------------------------------------------------------------------------
 * Public contract
 * ---------------------------------------------------------------------------------------- */

export type JaymoMood = "idle" | "wave" | "talk" | "dance" | "cheer" | "sleep";

export interface JaymoMascotProps {
  /** What Jaymo is doing. Every mood loops gently. Default `"idle"`. */
  mood?: JaymoMood;
  /** Rendered width and height in px. Default 96. */
  size?: number;
  style?: ViewStyle;
}
