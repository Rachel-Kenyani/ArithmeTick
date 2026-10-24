/**
 * The "5" badge that pops onto the full top row.
 */

import { Text } from "react-native";

import { colors } from "@/theme";

import { styles } from "../styles";
import { SPRING_POP } from "../utils/motion";
import { PopIn } from "./PopIn";

/** "5" badge on the full top row. */
export function FiveBadge({
  palActive,
  compact,
  size,
  left,
  top,
}: Readonly<{ palActive: boolean; compact: boolean; size: number; left: number; top: number }>) {
  return (
    <PopIn
      key={palActive ? "badge-pal" : "badge-gold"}
      from={0}
      rotateFrom={-30}
      delayMs={420}
      cfg={SPRING_POP}
      style={[
        styles.abs,
        styles.badge,
        { backgroundColor: palActive ? colors.atGlow : colors.atYellow, left, top, width: size, height: size, borderRadius: size },
      ]}
    >
      <Text style={[styles.badgeText, { fontSize: compact ? 15 : 19, lineHeight: compact ? 18 : 23 }]}>5</Text>
    </PopIn>
  );
}
