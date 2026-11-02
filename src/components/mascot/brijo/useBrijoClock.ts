import { useEffect } from "react";
import { useFrameCallback, useSharedValue } from "react-native-reanimated";

export function useBrijoClock(reduceMotion: boolean) {
  const clock = useSharedValue(0);

  const frame = useFrameCallback((info) => {
    clock.set(info.timeSinceFirstFrame / 1000);
  }, false);
  useEffect(() => {
    frame.setActive(!reduceMotion);
    return () => frame.setActive(false);
  }, [reduceMotion, frame]);
  return clock;
}
