/**
 * Brijo idle gaze: pupils glance around now and then; other moods look straight ahead.
 */

import { useEffect } from "react";
import { useSharedValue, withSpring } from "react-native-reanimated";

import { GAZE_SPOTS, GAZE_SPRING, type EyeKind } from "./eyeConfig";

export function useGaze(eyes: EyeKind, canGaze: boolean, reduceMotion: boolean) {
  const gazeX = useSharedValue(0);
  const gazeY = useSharedValue(0);

  useEffect(() => {
    if (eyes !== "open") return;
    if (reduceMotion) {
      gazeX.set(0);
      gazeY.set(0);
    } else {
      gazeX.set(withSpring(0, GAZE_SPRING));
      gazeY.set(withSpring(0, GAZE_SPRING));
    }
    if (!canGaze) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      timer = setTimeout(() => {
        const [x, y] = GAZE_SPOTS[Math.floor(Math.random() * GAZE_SPOTS.length)]; // NOSONAR decorative animation, not security-sensitive
        gazeX.set(withSpring(x, GAZE_SPRING));
        gazeY.set(withSpring(y, GAZE_SPRING));
        schedule();
      }, 2200 + Math.random() * 3000); // NOSONAR decorative animation timing, not security-sensitive
    };
    schedule();
    return () => clearTimeout(timer);
  }, [eyes, canGaze, reduceMotion, gazeX, gazeY]);

  return { gazeX, gazeY };
}
