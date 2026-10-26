/**
 * StatusBarScrim — adds only a light wash behind the clock / battery, so the meadow remains continuous under the
 * home controls. It sits above the backdrop and below everything else.
 */

import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATUS_WASH = "rgba(0,79,74,0)";

export default function StatusBarScrim() {
  const { top } = useSafeAreaInsets();
  const height = top;
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[STATUS_WASH, STATUS_WASH, "rgba(255,255,255,1)"]}
      locations={[0, top / height, 1]}
      style={[styles.scrim, { height }]}
    />
  );
}

const styles = StyleSheet.create({
  scrim: { position: "absolute", top: 0, left: 0, right: 0 },
});
