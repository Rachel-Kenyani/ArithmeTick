/**
 * One stop on the home level map (docs/APP-SHELL.md §5 "Home").
 *
 *   done     sun-yellow coin, number, teal check badge, 3 tiny stars above
 *   current  teal coin, pulsing ring, sun "Play" pill hanging off its bottom edge
 *   locked   muted mint coin, padlock over a small number; announced disabled — a tap only wiggles + sfx.nudge()
 *   quest    (kind "quest") rounded-square coin with a hand glyph and a leaf sprouting from its corner
 *
 * The whole stack (stars, coin, Play pill, title) is one Pressable, so the touch target is generous. (On native a
 * child drawn outside its parent's box can't be touched, so the Pressable's box spans the stars and labels.)
 * `pop` (a counter) plays the unlock bounce; the padlock flies off on its own when status leaves "locked".
 */

import { Pressable, StyleSheet } from "react-native";
import Animated, { useReducedMotion, withSpring } from "react-native-reanimated";

import CurrentRing from "@/features/home/components/level-node/CurrentRing";
import DoneStars from "@/features/home/components/level-node/DoneStars";
import LevelCoin from "@/features/home/components/level-node/LevelCoin";
import StopLabels from "@/features/home/components/level-node/StopLabels";
import { ABOVE, BELOW, SPRING, STATUS_WORD, coinRadius } from "@/features/home/components/level-node/constants";
import type { LevelNodeProps } from "@/features/home/components/level-node/types";
import { useLevelNodeMotion } from "@/features/home/components/level-node/useLevelNodeMotion";

export type { LevelNodeProps } from "@/features/home/components/level-node/types";

export default function LevelNode({ level, status, size, x, y, side, pop = 0, onPlay }: Readonly<LevelNodeProps>) {
  const reduceMotion = useReducedMotion();
  const isQuest = level.kind === "quest";
  const locked = status === "locked";
  const big = size >= 84;
  const radius = coinRadius(isQuest, big, size);

  // Box geometry: the coin sits ABOVE px from the top, centred horizontally.
  const boxW = size + 44;
  const boxH = ABOVE + size + BELOW;
  const coinLeft = (boxW - size) / 2;

  const { press, animated, startedLocked, flying, endFly, handlePress } = useLevelNodeMotion({
    level,
    locked,
    pop,
    reduceMotion,
    onPlay,
  });

  return (
    <Animated.View
      style={[
        styles.box,
        {
          left: x - boxW / 2,
          top: y - size / 2 - ABOVE,
          width: boxW,
          height: boxH,
          transformOrigin: [boxW / 2, ABOVE + size / 2, 0],
        },
        animated,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={() => {
          if (!locked) press.set(withSpring(0.93, SPRING));
        }}
        onPressOut={() => {
          press.set(withSpring(1, SPRING));
        }}
        accessibilityRole="button"
        accessibilityLabel={`Level ${level.number}, ${level.title}, ${STATUS_WORD[status]}`}
        accessibilityState={{ disabled: locked }}
        style={StyleSheet.absoluteFill}
      >
        {/* Pulsing ring around the level to play now */}
        {status === "current" ? <CurrentRing left={coinLeft} size={size} radius={radius} reduceMotion={reduceMotion} /> : null}

        {/* Three tiny stars above a finished level (part of the touch box, like the labels below) */}
        {status === "done" ? <DoneStars size={size} big={big} /> : null}

        <LevelCoin
          level={level}
          status={status}
          size={size}
          left={coinLeft}
          radius={radius}
          side={side}
          reduceMotion={reduceMotion}
          startedLocked={startedLocked}
          flying={flying}
          onFlyDone={endFly}
        />

        {/* Below the coin: "Play" pill (current) + the level title. Inside the touch box — the "Play" pill is the
            first thing a child taps, so it (and the title) must start the level too. */}
        <StopLabels status={status} size={size} title={level.title} reduceMotion={reduceMotion} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: { position: "absolute", zIndex: 10 },
});
