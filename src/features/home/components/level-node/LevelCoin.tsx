/** A level stop's rounded platform: chunky edge slab, face, quest leaf and done check badge. */

import { StyleSheet, Text, View } from "react-native";

import { CheckIcon, LockIcon } from "@/components/ui/icons";
import FlyingLock from "@/features/home/components/level-node/FlyingLock";
import QuestLeaf from "@/features/home/components/level-node/QuestLeaf";
import SpringIn from "@/features/home/components/level-node/SpringIn";
import UnlockedFace from "@/features/home/components/level-node/UnlockedFace";
import { ABOVE, FACE } from "@/features/home/components/level-node/constants";
import { sharedStyles } from "@/features/home/components/level-node/sharedStyles";
import type { LevelNodeProps } from "@/features/home/components/level-node/types";
import type { LevelDef, LevelStatus } from "@/data/levels";
import { colors } from "@/theme";

export default function LevelCoin({
  level,
  status,
  width,
  height,
  left,
  radius,
  side,
  reduceMotion,
  startedLocked,
  flying,
  onFlyDone,
}: Readonly<{
  level: LevelDef;
  status: LevelStatus;
  width: number;
  height: number;
  left: number;
  radius: number;
  side: LevelNodeProps["side"];
  reduceMotion: boolean;
  startedLocked: boolean;
  flying: boolean;
  onFlyDone: () => void;
}>) {
  const isQuest = level.kind === "quest";
  const locked = status === "locked";
  const big = width >= 92;
  const face = FACE[status];
  const smallNumber = big ? 21 : 18;

  const lockedFace = (
    <>
      <LockIcon
        size={big ? 30 : 26}
        strokeWidth={2.4}
        color={FACE.locked.text}
      />
      <Text
        style={[
          sharedStyles.num,
          { fontSize: smallNumber, color: FACE.locked.text },
        ]}
      >
        {level.number}
      </Text>
    </>
  );

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left, top: ABOVE, width, height }}
    >
      <View
        style={[
          styles.edge,
          { top: face.edgeH, borderRadius: radius, backgroundColor: face.edge },
        ]}
      />
      <View
        style={[
          styles.coin,
          {
            borderRadius: radius,
            backgroundColor: face.bg,
            borderColor: face.border,
            borderStyle: "solid",
            opacity: locked ? 0.5 : 1,
          },
        ]}
      >
        {locked ? (
          <View style={sharedStyles.faceContent}>{lockedFace}</View>
        ) : (
          <SpringIn
            animate={startedLocked}
            reduce={reduceMotion}
            from={{ scale: 0.2, y: 0 }}
            delay={120}
            style={sharedStyles.faceContent}
          >
            <UnlockedFace
              isQuest={isQuest}
              big={big}
              number={level.number}
              color={face.text}
            />
          </SpringIn>
        )}
        {flying ? (
          <FlyingLock size={height} reduce={reduceMotion} onDone={onFlyDone}>
            {lockedFace}
          </FlyingLock>
        ) : null}
      </View>

      {/* Quest leaf ornament — only on stops the child can reach, to keep the locked part of the map quiet */}
      {isQuest && !locked ? (
        <QuestLeaf side={side} big={big} dimmed={locked} />
      ) : null}

      {/* Done check badge */}
      {status === "done" ? (
        <View style={styles.check}>
          <CheckIcon size={17} strokeWidth={3.2} color={colors.white} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  edge: { position: "absolute", left: 0, right: 0, height: "100%" },
  coin: {
    width: "100%",
    height: "100%",
    borderWidth: 4,
    overflow: "visible",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#003c5a",
    shadowOpacity: 0.35,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 10 },
  },
  check: {
    position: "absolute",
    right: -6,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.jgTeal,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
