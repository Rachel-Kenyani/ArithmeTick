import { useCallback, useMemo, useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import LevelNode from "@/features/home/components/level-node/LevelNode";
import MapFinishFlag from "@/features/home/components/level-map/MapFinishFlag";
import MapTrail from "@/features/home/components/level-map/MapTrail";
import SparkleBurst from "@/features/home/components/level-map/SparkleBurst";
import { clamp, computeLayout } from "@/features/home/components/level-map/computeLayout";
import { useReportFocus } from "@/features/home/components/level-map/useReportFocus";
import { useUnlockSequence } from "@/features/home/components/level-map/useUnlockSequence";
import { levelStatus, type LevelDef, type LevelStatus } from "@/data/levels";

export interface LevelMapProps {
  levels: readonly LevelDef[];
  completed: number;
  regionHeight: number;
  onFocusY?: (y: number) => void;
  unlockLevel: number | null;
  onUnlockDone: () => void;
  onPlay: (level: LevelDef) => void;
}

export default function LevelMap({ levels, completed, regionHeight, onFocusY, unlockLevel, onUnlockDone, onPlay }: Readonly<LevelMapProps>) {
  const reduceMotion = useReducedMotion();
  const [boxWidth, setBoxWidth] = useState(0);
  const count = levels.length;

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    setBoxWidth((prev) => (prev === w ? prev : w));
  }, []);

  const layout = useMemo(
    () => (boxWidth > 0 && regionHeight > 0 ? computeLayout(boxWidth, regionHeight, count) : null),
    [boxWidth, regionHeight, count],
  );
  const measured = layout !== null;

  const { unlock, unlockSegment, popTick } = useUnlockSequence({ unlockLevel, measured, reduceMotion, onUnlockDone });

  const allDone = completed >= count;
  const currentIndex = allDone ? count - 1 : completed;

  const statusOf = (n: number): LevelStatus => {
    if (unlock?.level === n && unlock.phase === "waiting") return "locked";
    return levelStatus(n, completed);
  };
  const walked = (segmentIndex: number) => {
    const to = segmentIndex + 2;
    if (unlock?.level === to && unlock.phase !== "hop") return false;
    return to <= completed + 1;
  };

  const focusIndex = unlock ? unlock.level - 1 : currentIndex;
  const focusY = layout ? layout.nodes[clamp(focusIndex, 0, count - 1)].y : null;
  useReportFocus(focusY, onFocusY);

  const handlePlay = useCallback((level: LevelDef) => onPlay(level), [onPlay]);

  return (
    <View onLayout={handleLayout} style={{ width: "100%", height: layout?.height ?? 560 }}>
      {layout ? (
        <>
          <MapTrail layout={layout} unlockSegment={unlockSegment} allDone={allDone} walked={walked} />

          <MapFinishFlag layout={layout} />

          {levels.map((level, i) => {
            const status = statusOf(level.number);
            const p = layout.nodes[i];
            return (
              <LevelNode
                key={level.number}
                level={level}
                status={status}
                size={status === "current" ? layout.currentNode : layout.node}
                x={p.x}
                y={p.y}
                side={i % 2 === 0 ? "left" : "right"}
                pop={unlock?.level === level.number ? popTick : 0}
                onPlay={handlePlay}
              />
            );
          })}

          {unlock && unlock.phase !== "waiting" && !reduceMotion ? (
            <SparkleBurst
              key="burst"
              x={layout.nodes[unlock.level - 1].x}
              y={layout.nodes[unlock.level - 1].y}
              radius={layout.currentNode * 0.85}
            />
          ) : null}
        </>
      ) : null}
    </View>
  );
}
