import { Text } from "react-native";

import { colors } from "@/theme";

import { styles } from "../styles";
import { SPRING_POP } from "../utils/motion";
import { PopIn } from "./PopIn";

export function FiveBadge({
  palActive,
  compact,
  size,
  left,
  top,
}: Readonly<{ palActive: boolean; compact: boolean; size: number; left: number; top: number }>) {
  return (
    <PopIn
      key={palActive ? "badge-pal" : "badge-five"}
      from={0}
      rotateFrom={-30}
      delayMs={420}
      cfg={SPRING_POP}
      style={[
        styles.abs,
        styles.badge,
        { backgroundColor: palActive ? colors.atGlow : colors.atPurple, left, top, width: size, height: size, borderRadius: size },
      ]}
    >
      <Text style={[styles.badgeText, { color: palActive ? colors.atInk : colors.white, fontSize: compact ? 22 : 28, lineHeight: compact ? 26 : 33 }]}>5</Text>
    </PopIn>
  );
}
