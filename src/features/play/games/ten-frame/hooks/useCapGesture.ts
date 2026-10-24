/**
 * Pan (drag on the UI thread) + tap gestures of one bottle cap; JS only hears pick-up, near / far and the drop.
 */

import { useCompetingGestures, usePanGesture, useTapGesture } from "react-native-gesture-handler";
import { cancelAnimation, useSharedValue, withSpring, type SharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { NEAR_PX } from "../constants";
import type { CapMotion, DragShared } from "../types";
import { isPointNear } from "../utils/math";
import { SPRING_UI } from "../utils/motion";

interface CapGestureArgs {
  id: number;
  size: number;
  mv: CapMotion;
  drag: DragShared;
  canDrag: boolean;
  canTap: boolean;
  lift: SharedValue<number>;
  dragT: SharedValue<number>;
  dragging: SharedValue<number>;
  onDragStart: (id: number) => void;
  onNear: (near: boolean) => void;
  onDragEnd: (id: number, x: number, y: number) => void;
  onTap: (id: number) => void;
}

export function useCapGesture({
  id,
  size,
  mv,
  drag,
  canDrag,
  canTap,
  lift,
  dragT,
  dragging,
  onDragStart,
  onNear,
  onDragEnd,
  onTap,
}: Readonly<CapGestureArgs>) {
  /** finger offset from the cap centre + the cap centre the drag started from */
  const grab = useSharedValue({ ox: 0, oy: 0, sx: 0, sy: 0 });

  const pan = usePanGesture({
    enabled: canDrag,
    maxPointers: 1,
    minDistance: 4,
    onBegin: () => {
      lift.set(withSpring(1.06, SPRING_UI));
    },
    onActivate: (e) => {
      if (drag.active.get() !== -1) return;
      drag.active.set(id);
      dragging.set(1);
      cancelAnimation(mv.x);
      cancelAnimation(mv.y);
      grab.set({ ox: e.x - size / 2, oy: e.y - size / 2, sx: mv.x.get() - e.translationX, sy: mv.y.get() - e.translationY });
      lift.set(withSpring(1.12, SPRING_UI));
      dragT.set(withSpring(1, SPRING_UI));
      scheduleOnRN(onDragStart, id);
    },
    onUpdate: (e) => {
      if (drag.active.get() !== id) return;
      const g = grab.get();
      const nx = g.sx + e.translationX;
      const ny = g.sy + e.translationY;
      mv.x.set(nx);
      mv.y.set(ny);
      // hit-test the finger (not the cap centre), like the web's pointer point
      const isNear = isPointNear(nx + g.ox, ny + g.oy, drag.grid.get(), NEAR_PX);
      if (isNear !== drag.near.get()) {
        drag.near.set(isNear);
        scheduleOnRN(onNear, isNear);
      }
    },
    onFinalize: () => {
      lift.set(withSpring(1, SPRING_UI));
      dragT.set(withSpring(0, SPRING_UI));
      if (drag.active.get() !== id) return;
      drag.active.set(-1);
      drag.near.set(false);
      dragging.set(0);
      const g = grab.get();
      scheduleOnRN(onDragEnd, id, mv.x.get() + g.ox, mv.y.get() + g.oy);
    },
  });

  const tap = useTapGesture({
    enabled: canTap,
    onBegin: () => {
      lift.set(withSpring(1.06, SPRING_UI));
    },
    onDeactivate: (e) => {
      if (!e.canceled) scheduleOnRN(onTap, id);
    },
    onFinalize: () => {
      if (dragging.get() === 0) lift.set(withSpring(1, SPRING_UI));
    },
  });

  return useCompetingGestures(pan, tap);
}
