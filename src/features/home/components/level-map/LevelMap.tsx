/**
 * LevelMap — the winding jungle trail on the home screen (docs/APP-SHELL.md §5 "Home").
 *
 * - Six stops zig-zag up the screen (level 1 at the bottom, by the grass — the trail climbs like a jungle
 *   path) joined by one sandy SVG spline that terminates at the purple finish flag.
 * - Geometry is computed in px from the measured column width (onLayout) and the scroll region's height
 *   (`regionHeight`): on a typical phone (390×844) the whole trail fits; on short screens it scrolls and the
 *   home screen centres the stop to play on load (see `onFocusY`).
 * - `unlockLevel` (from state.justUnlocked) plays the unlock: the stop starts locked, its padlock pops off
 *   with a sparkle + sfx.groupPulse(), the walked pebbles reach it — then `onUnlockDone`.
 */

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
  /** Levels finished in this grade (0..6). */
  completed: number;
  /** Height of the scroll region the map lives in (used for sizing). 0 until measured. */
  regionHeight: number;
  /**
   * Called once, when the map is first laid out, with the y (in map coordinates) of the centre of the stop to
   * play — the screen scrolls it into view.
   */
  onFocusY?: (y: number) => void;
  /** Level that was just unlocked (play the unlock sequence once), or null. */
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
  const currentIndex = allDone ? count - 1 : completed; // 0-based index of the stop to play (or the last one)

  const statusOf = (n: number): LevelStatus => {
    if (unlock?.level === n && unlock.phase === "waiting") return "locked";
    return levelStatus(n, completed);
  };
  const walked = (segmentIndex: number) => {
    const to = segmentIndex + 2; // level number the segment leads to
    if (unlock?.level === to && unlock.phase !== "hop") return false;
    return to <= completed + 1;
  };

  // First measured layout: report the stop to play so the screen can centre it (it scrolls to the top when complete).
  const focusIndex = unlock ? unlock.level - 1 : currentIndex;
  const focusY = layout ? layout.nodes[clamp(focusIndex, 0, count - 1)].y : null;
  useReportFocus(focusY, onFocusY);

  const handlePlay = useCallback((level: LevelDef) => onPlay(level), [onPlay]);

  return (
    <View onLayout={handleLayout} style={{ width: "100%", height: layout?.height ?? 560 }}>
      {layout ? (
        <>
          {/* Trail */}
          <MapTrail layout={layout} unlockSegment={unlockSegment} allDone={allDone} walked={walked} />

          {/* Finish flag. (The bushes / flowers / rocks along the edges were dropped to declutter the map.) */}
          <MapFinishFlag layout={layout} />

          {/* Stops */}
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

          {/* Unlock sparkle */}
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
