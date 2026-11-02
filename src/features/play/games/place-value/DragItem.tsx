import type { ReactNode } from "react";
import { GestureDetector, useCompetingGestures, usePanGesture, useTapGesture } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { SPRING_UI } from "../ten-frame/utils/motion";

export function DragItem({
  enabled,
  hitSlop,
  label,
  onTap,
  onDrop,
  children,
}: Readonly<{
  enabled: boolean;
  hitSlop: number;
  label: string;
  onTap: () => void;
  onDrop: (x: number, y: number) => void;
  children: ReactNode;
}>) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const ax = useSharedValue(0);
  const ay = useSharedValue(0);
  const lift = useSharedValue(1);

  const pan = usePanGesture({
    enabled,
    maxPointers: 1,
    minDistance: 10,
    hitSlop,
    onActivate: () => {
      lift.set(withSpring(1.15, SPRING_UI));
    },
    onUpdate: (e) => {
      tx.set(e.translationX);
      ty.set(e.translationY);
      ax.set(e.absoluteX);
      ay.set(e.absoluteY);
    },
    onFinalize: () => {
      const x = ax.get();
      const y = ay.get();
      lift.set(withSpring(1, SPRING_UI));
      tx.set(withSpring(0, SPRING_UI));
      ty.set(withSpring(0, SPRING_UI));
      if (x || y) scheduleOnRN(onDrop, x, y);
      ax.set(0);
      ay.set(0);
    },
  });
  const tap = useTapGesture({
    enabled,
    hitSlop,
    onDeactivate: (e) => {
      if (!e.canceled) scheduleOnRN(onTap);
    },
  });
  const gesture = useCompetingGestures(pan, tap);

  const st = useAnimatedStyle(() => ({
    zIndex: lift.get() > 1 ? 20 : 0,
    transform: [{ translateX: tx.get() }, { translateY: ty.get() }, { scale: lift.get() }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View accessible accessibilityRole={enabled ? "button" : "image"} accessibilityLabel={label} onAccessibilityTap={onTap} style={st}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
