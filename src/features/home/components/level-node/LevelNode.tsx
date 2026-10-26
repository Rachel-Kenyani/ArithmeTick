/**
 * One stop on the home level map (docs/APP-SHELL.md §5 "Home").
 *
 *   done     sun-yellow platform, number, teal check badge, 3 tiny stars above
 *   current  teal platform, pulsing ring and a sun "Play" cue; the whole node starts the level
 *   locked   muted mint platform, padlock over a small number; announced disabled — a tap only wiggles + sfx.nudge()
 *   quest    rounded platform with a hand glyph and a leaf sprouting from its corner
 *
 * The whole stack (stars, platform, Play cue, title) is one Pressable, so the touch target is generous. (On native a
 * child drawn outside its parent's box can't be touched, so the Pressable's box spans the stars and labels.)
 * `pop` (a counter) plays the unlock bounce; the padlock flies off on its own when status leaves "locked".
 */

import { Pressable, StyleSheet } from "react-native";
import Animated, { useReducedMotion, withSpring } from "react-native-reanimated";

import CurrentRing from "@/features/home/components/level-node/CurrentRing";
import DoneStars from "@/features/home/components/level-node/DoneStars";
import LevelCoin from "@/features/home/components/level-node/LevelCoin";
import StopLabels from "@/features/home/components/level-node/StopLabels";
import { ABOVE, BELOW, SPRING, STATUS_WORD, coinRadius, platformHeight, platformWidth } from "@/features/home/components/level-node/constants";
import type { LevelNodeProps } from "@/features/home/components/level-node/types";
import { useLevelNodeMotion } from "@/features/home/components/level-node/useLevelNodeMotion";

export type { LevelNodeProps } from "@/features/home/components/level-node/types";

export default function LevelNode({ level, status, size, x, y, side, pop = 0, onPlay }: Readonly<LevelNodeProps>) {
  const reduceMotion = useReducedMotion();
  const isQuest = level.kind === "quest";
  const locked = status === "locked";
  const big = size >= 84;
  const radius = coinRadius(isQuest, big, size);
  const platformW = platformWidth(size);
  const platformH = platformHeight(size);

  // Box geometry: the platform sits ABOVE px from the top, centred horizontally.
  const boxW = platformW + 44;
  const boxH = ABOVE + platformH + BELOW;
  const coinLeft = (boxW - platformW) / 2;

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
          top: y - platformH / 2 - ABOVE,
          width: boxW,
          height: boxH,
          transformOrigin: [boxW / 2, ABOVE + platformH / 2, 0],
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
        accessibilityLabel={locked ? `Level ${level.number}, locked. Finish level ${level.number - 1} to unlock.` : `Level ${level.number}, ${level.title}, ${STATUS_WORD[status]}`}
        accessibilityHint={locked ? `Finish level ${level.number - 1} to unlock` : "Starts this level"}
        style={StyleSheet.absoluteFill}
      >
        {status === "current" ? <CurrentRing left={coinLeft} width={platformW} height={platformH} radius={radius} reduceMotion={reduceMotion} /> : null}
        {/* Three tiny stars above a finished level (part of the touch box, like the labels below) */}
        {status === "done" ? <DoneStars height={platformH} big={big} /> : null}

        <LevelCoin
          level={level}
          status={status}
          width={platformW}
          height={platformH}
          left={coinLeft}
          radius={radius}
          side={side}
          reduceMotion={reduceMotion}
          startedLocked={startedLocked}
          flying={flying}
          onFlyDone={endFly}
        />

        <StopLabels status={status} height={platformH} title={level.title} reduceMotion={reduceMotion} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: { position: "absolute", zIndex: 10 },
});
