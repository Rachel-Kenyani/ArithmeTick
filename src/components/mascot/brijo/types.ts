import type { ViewStyle } from "react-native";

export type BrijoMood = "idle" | "wave" | "talk" | "dance" | "cheer" | "sleep";

export interface BrijoMascotProps {
  mood?: BrijoMood;
  size?: number;
  style?: ViewStyle;
}
