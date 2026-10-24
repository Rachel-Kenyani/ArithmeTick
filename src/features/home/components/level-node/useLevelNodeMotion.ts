/** A level stop's motion state: unlock bounce, flying padlock, press squish and the locked "not yet" nudge. */

import { AccessibilityInfo } from "react-native";
import { useEffect, useState } from "react";
import { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

import { shakeLocked, wobbleLocked } from "@/features/home/components/level-node/animations";
import { easeOut } from "@/features/home/components/level-node/constants";
import { sfx } from "@/services/audio";
import type { LevelDef } from "@/data/levels";

export function useLevelNodeMotion({
  level,
  locked,
  pop,
  reduceMotion,
  onPlay,
}: Readonly<{ level: LevelDef; locked: boolean; pop: number; reduceMotion: boolean; onPlay: (level: LevelDef) => void }>) {
  const scale = useSharedValue(1);
  const press = useSharedValue(1);
  const rot = useSharedValue(0);
  const shakeX = useSharedValue(0);

  // Unlock bounce (driven by the map's unlock sequence). Only an increase plays it: the map hands back 0
  // when the sequence ends, and that must not bounce the stop a second time.
  const [lastPop, setLastPop] = useState(pop);
  const [bounce, setBounce] = useState(0);
  if (pop !== lastPop) {
    setLastPop(pop);
    if (pop > lastPop && !reduceMotion) setBounce((b) => b + 1);
  }
  useEffect(() => {
    if (!bounce) return;
    const seg = (v: number) => withTiming(v, { duration: 650 / 4, easing: easeOut });
    scale.set(withSequence(seg(1.22), seg(0.93), seg(1.05), seg(1)));
  }, [bounce, scale]);

  // Padlock flies off when the stop leaves "locked" (web: AnimatePresence exit).
  const [startedLocked] = useState(locked);
  const [prevLocked, setPrevLocked] = useState(locked);
  const [flying, setFlying] = useState(false);
  if (prevLocked !== locked) {
    setPrevLocked(locked);
    setFlying(prevLocked && !locked);
  }
  const [endFly] = useState(() => () => setFlying(false));

  const handlePress = () => {
    if (locked) {
      sfx.nudge();
      AccessibilityInfo.announceForAccessibility(`Finish level ${level.number - 1} to unlock`);
      if (reduceMotion) shakeLocked(shakeX);
      else wobbleLocked(rot);
      return;
    }
    sfx.click();
    onPlay(level);
  };

  const animated = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { rotate: `${rot.value}deg` },
      { scale: scale.value * press.value },
    ],
  }));

  return { press, animated, startedLocked, flying, endFly, handlePress };
}
