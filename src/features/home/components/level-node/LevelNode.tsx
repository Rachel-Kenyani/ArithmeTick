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
