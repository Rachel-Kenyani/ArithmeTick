/**
 * Splash intro — frame 14's sparkle burst: a ring of stars flying out from Brijo's head.
 */

import { View } from "react-native";
import type { SharedValue } from "react-native-reanimated";

import BurstStar, { BURST_ANGLES } from "./BurstStar";

export default function SparkleBurst({
  left,
  top,
  progress,
  unit,
}: Readonly<{
  left: number;
  top: number;
  progress: SharedValue<number>;
  unit: number;
}>) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left,
        top,
      }}
    >
      {BURST_ANGLES.map((angle) => (
        <BurstStar key={angle} progress={progress} angle={angle} unit={unit} />
      ))}
    </View>
  );
}
