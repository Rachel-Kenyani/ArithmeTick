/**
 * StatusBarScrim — keeps the clock / battery clear of the meadow art: the map's ground colour, solid across the
 * top safe area, then fading to transparent over 60pt. Sits above the backdrop and below everything else.
 */

import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** The meadow's ground colour (home-bg.svg's base fill). */
export const MEADOW = "#D6F4DE";

export default function StatusBarScrim() {
  const { top } = useSafeAreaInsets();
  const height = top;
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[MEADOW, MEADOW, "rgba(214,244,222,0)"]}
      locations={[0, top / height, 1]}
      style={[styles.scrim, { height }]}
    />
  );
}

const styles = StyleSheet.create({
  scrim: { position: "absolute", top: 0, left: 0, right: 0 },
});
