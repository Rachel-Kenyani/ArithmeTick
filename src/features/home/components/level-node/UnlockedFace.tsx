import { Text } from "react-native";

import { sharedStyles as styles } from "@/features/home/components/level-node/sharedStyles";

export default function UnlockedFace({ big, number, color }: Readonly<{ big: boolean; number: number; color: string }>) {
  return <Text style={[styles.num, { fontSize: big ? 40 : 34, color }]}>{number}</Text>;
}
