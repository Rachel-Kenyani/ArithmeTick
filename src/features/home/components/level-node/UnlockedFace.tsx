/** The face of a reachable stop's platform. */

import { Text } from "react-native";

import { sharedStyles as styles } from "@/features/home/components/level-node/sharedStyles";

/** The face of a reachable stop: its big number (a Move & Play stop is marked by the leaf instead). */
export default function UnlockedFace({ big, number, color }: Readonly<{ big: boolean; number: number; color: string }>) {
  return <Text style={[styles.num, { fontSize: big ? 40 : 34, color }]}>{number}</Text>;
}
