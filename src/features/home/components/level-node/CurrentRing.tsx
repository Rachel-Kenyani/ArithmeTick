/** The gentle focus ring around the level to play now. */

import { View } from "react-native";

import PulseRing from "@/features/home/components/level-node/PulseRing";
import { ABOVE } from "@/features/home/components/level-node/constants";
import { sharedStyles as styles } from "@/features/home/components/level-node/sharedStyles";

export default function CurrentRing({ left, width, height, radius, reduceMotion }: Readonly<{ left: number; width: number; height: number; radius: number; reduceMotion: boolean }>) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", left, top: ABOVE, width, height }}>
      <View style={[styles.ring, { borderRadius: radius + 7, backgroundColor: "rgba(255,255,255,0.45)" }]} />
      {reduceMotion ? null : <PulseRing radius={radius} />}
    </View>
  );
}
