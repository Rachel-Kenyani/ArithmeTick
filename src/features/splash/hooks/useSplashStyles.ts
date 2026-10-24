/**
 * Splash intro — the animated styles that turn the timeline's shared values into the layers' movement and fades.
 */

import { interpolateColor, useAnimatedStyle } from "react-native-reanimated";

import { BG, SKY_BASE } from "../constants";
import type { SplashValues } from "./useSplashValues";

export function useSplashStyles(v: SplashValues, W: number, grassH: number) {
  const {
    wordOpacity,
    wordY,
    smallOpacity,
    owlY,
    bigOpacity,
    bigX,
    bigY,
    bigScale,
    breath,
    squashX,
    squashY,
    sky,
    scene,
    bg11,
    bg12,
  } = v;
  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ translateY: wordY.value }],
  }));
  const owlStyle = useAnimatedStyle(() => ({
    opacity: smallOpacity.value,
    transform: [{ translateY: owlY.value }],
  }));
  const bigStyle = useAnimatedStyle(() => ({
    opacity: bigOpacity.value,
    transform: [
      { translateX: bigX.value },
      { translateY: bigY.value },
      { scale: bigScale.value * breath.value },
      { scaleX: squashX.value },
      { scaleY: squashY.value },
    ],
  }));
  const skyStyle = useAnimatedStyle(() => ({ opacity: sky.value }));
  // Frames 1–5 sit on BG; from frame 6 the screen's base colour is SKY_BASE (shows wherever art doesn't cover).
  const baseStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(sky.value, [0, 1], [BG, SKY_BASE]),
  }));
  const branchStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, scene.value * 2),
    transform: [{ translateX: (scene.value - 1) * W * 0.6 }],
  }));
  // Frame 10's background (sky + grass) settles in under the rising vector grass, which then gives way to frame 11's.
  const bg10Style = useAnimatedStyle(() => ({ opacity: scene.value }));
  const bg11Style = useAnimatedStyle(() => ({ opacity: bg11.value }));
  const bg12Style = useAnimatedStyle(() => ({ opacity: bg12.value }));
  const grassStyle = useAnimatedStyle(() => ({
    opacity: 1 - bg11.value,
    transform: [{ translateY: (1 - scene.value) * grassH }],
  }));
  return {
    wordStyle,
    owlStyle,
    bigStyle,
    skyStyle,
    baseStyle,
    branchStyle,
    bg10Style,
    bg11Style,
    bg12Style,
    grassStyle,
  };
}
