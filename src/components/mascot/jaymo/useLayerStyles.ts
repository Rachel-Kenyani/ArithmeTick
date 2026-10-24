/**
 * Jaymo's whole-body view layers: boop/pop, shadow, rig sway/hop and squash animated styles.
 */

import { useAnimatedStyle, type SharedValue } from "react-native-reanimated";

import { val, type Rig } from "./sampling";

export function useLayerStyles(rig: Rig, popX: SharedValue<number>, popY: SharedValue<number>, k: number) {
  const boopStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: popX.value }, { scaleY: popY.value }],
  }));
  const shadowStyle = useAnimatedStyle(() => ({
    opacity: val(rig, "shadow", "opacity"),
    transform: [{ scaleX: val(rig, "shadow", "scaleX") }],
  }));
  const rigStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: val(rig, "rig", "y") * k },
      { rotate: `${val(rig, "rig", "rotate")}deg` },
      { scaleX: val(rig, "rig", "scaleX") },
    ],
  }));
  const squashStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: val(rig, "squash", "scaleX") }, { scaleY: val(rig, "squash", "scaleY") }],
  }));

  return { boopStyle, shadowStyle, rigStyle, squashStyle };
}
