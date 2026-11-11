import { StyleSheet, View } from "react-native";
import { useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TOP_BAR_SHIELD } from "./constants";

/**
 * The translucent teal band behind the phone's time, signal and battery, as on the map's top bar, so they stay
 * readable over illustrated backgrounds. Screens with the app top bar already have it and do not need this.
 */
export default function StatusBarShield() {
  const { top } = useSafeAreaInsets();
  const focused = useIsFocused();
  return (
    <>
      {focused ? <StatusBar style="light" /> : null}
      <View pointerEvents="none" style={[styles.shield, { height: top }]} />
    </>
  );
}

const styles = StyleSheet.create({
  shield: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: TOP_BAR_SHIELD },
});
