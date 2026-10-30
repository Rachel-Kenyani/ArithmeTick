/**
 * Brijo's single frame-callback clock (seconds) that drives every mood loop.
 */

import { useEffect } from "react";
import { useFrameCallback, useSharedValue } from "react-native-reanimated";

export function useBrijoClock(reduceMotion: boolean) {
  const clock = useSharedValue(0);

  // One clock for every loop; never started under reduced motion.
  const frame = useFrameCallback((info) => {
    clock.set(info.timeSinceFirstFrame / 1000);
  }, false);
  useEffect(() => {
    frame.setActive(!reduceMotion);
    return () => frame.setActive(false);
  }, [reduceMotion, frame]);
  return clock;
}
