import { useEffect } from "react";
import { cancelAnimation, useSharedValue, withTiming } from "react-native-reanimated";

import { BREATHE_MS, RM, breathe } from "../utils/motion";

export function useBreath(on: boolean, a: number, b: number, rest: number, ms = BREATHE_MS) {
  const v = useSharedValue(rest);
  useEffect(() => {
    if (on) v.set(breathe(a, b, ms));
    else {
      cancelAnimation(v);
      v.set(withTiming(rest, { duration: 300, reduceMotion: RM }));
    }
  }, [on, a, b, rest, ms, v]);
  return v;
}
