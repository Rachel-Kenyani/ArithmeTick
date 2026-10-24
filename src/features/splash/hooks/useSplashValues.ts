/**
 * Splash intro — the shared values the timeline drives and the animated styles read.
 */

import { useSharedValue } from "react-native-reanimated";

export type SplashValues = ReturnType<typeof useSplashValues>;

export function useSplashValues(
  reduce: boolean,
  bigStartScale: number,
  bigStartY: number,
) {
  const wordOpacity = useSharedValue(1);
  const wordY = useSharedValue(0);
  const owlY = useSharedValue(0);
  const smallOpacity = useSharedValue(1);
  const bigOpacity = useSharedValue(0);
  const bigScale = useSharedValue(reduce ? 1 : bigStartScale);
  const bigY = useSharedValue(reduce ? 0 : bigStartY);
  const bigX = useSharedValue(0);
  const bodyOpacity = useSharedValue(0);
  const pupils = useSharedValue(1);
  const sky = useSharedValue(0);
  const scene = useSharedValue(0);
  const bg11 = useSharedValue(0);
  const bg12 = useSharedValue(0);
  const headTilt = useSharedValue(0);
  const wink = useSharedValue(1);
  const burst = useSharedValue(0);
  const squashX = useSharedValue(1);
  const squashY = useSharedValue(1);
  const breath = useSharedValue(1);
  return {
    wordOpacity,
    wordY,
    owlY,
    smallOpacity,
    bigOpacity,
    bigScale,
    bigY,
    bigX,
    bodyOpacity,
    pupils,
    sky,
    scene,
    bg11,
    bg12,
    headTilt,
    wink,
    burst,
    squashX,
    squashY,
    breath,
  };
}
