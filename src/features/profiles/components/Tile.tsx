/**
 * A Profiles grid tile: entrance / chosen pop / dimmed step-back, plus the press squish.
 */

import { useEffect, type ReactNode } from "react";
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { easeOut } from "../utils/easing";
import type { TileState } from "../utils/gridLayout";

/** The tile's entrance / chosen pop / dimmed step-back, plus the press squish. */
export default function Tile({
  index,
  state,
  reduce,
  disabled,
  onPress,
  accessibilityLabel,
  width,
  style,
  children,
}: Readonly<{
  index: number;
  state: TileState;
  reduce: boolean;
  disabled: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  width: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}>) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(reduce ? 0 : 22);
  const scale = useSharedValue(reduce ? 1 : 0.9);
  const press = useSharedValue(1);

  useEffect(() => {
    if (reduce) {
      if (state === "show")
        opacity.set(withDelay(index * 30, withTiming(1, { duration: 200 })));
      else if (state === "dimmed")
        opacity.set(withTiming(0.5, { duration: 200 }));
      else opacity.set(1);
      return;
    }
    if (state === "show") {
      const spring = { stiffness: 380, damping: 24 };
      const d = 120 + index * 70;
      opacity.set(withDelay(d, withSpring(1, spring)));
      y.set(withDelay(d, withSpring(0, spring)));
      scale.set(withDelay(d, withSpring(1, spring)));
    } else if (state === "chosen") {
      opacity.set(1);
      y.set(0);
      scale.set(
        withSequence(
          withTiming(1.09, { duration: 210, easing: easeOut }),
          withTiming(1.03, { duration: 210, easing: easeOut }),
        ),
      );
    } else {
      const t = { duration: 280, easing: easeOut };
      opacity.set(withTiming(0.6, t));
      y.set(withTiming(0, t));
      scale.set(withTiming(0.94, t));
    }
  }, [state, reduce, index, opacity, y, scale]);

  const animated = useAnimatedStyle(() => ({
    opacity: Math.min(1, opacity.value),
    transform: [{ translateY: y.value }, { scale: scale.value * press.value }],
  }));

  return (
    <Animated.View
      style={[{ width, zIndex: state === "chosen" ? 10 : 0 }, animated]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          if (!disabled)
            press.set(withSpring(0.95, { stiffness: 500, damping: 30 }));
        }}
        onPressOut={() => {
          press.set(withSpring(1, { stiffness: 500, damping: 30 }));
        }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        style={[styles.tile, style]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    paddingHorizontal: 8,
  },
});
