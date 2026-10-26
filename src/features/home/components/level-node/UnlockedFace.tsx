/** The face of a reachable stop's platform. */

import { Text } from "react-native";

import { HandIcon } from "@/components/ui/icons";
import { sharedStyles as styles } from "@/features/home/components/level-node/sharedStyles";

/** The face of a reachable stop: a hand + small number for a quest, otherwise a big number. */
export default function UnlockedFace({ isQuest, big, number, color }: Readonly<{ isQuest: boolean; big: boolean; number: number; color: string }>) {
  if (isQuest) {
    return (
      <>
        <HandIcon size={big ? 34 : 30} strokeWidth={2.2} color={color} />
        <Text style={[styles.num, { marginTop: 2, fontSize: big ? 21 : 18, color }]}>
          {number}
        </Text>
      </>
    );
  }
  return <Text style={[styles.num, { fontSize: big ? 40 : 34, color }]}>{number}</Text>;
}
