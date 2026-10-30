/**
 * Brijo's head on /welcome: entrance, float, tilt, blink and tap-squish on the whole head.
 */

import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import BrijoHeadArt, { HEAD_VIEW } from "@/components/mascot/BrijoHeadArt";

import { SPRING } from "../utils/welcomeMotion";

const HEAD_ASPECT = HEAD_VIEW.h / HEAD_VIEW.w;
const ease = Easing.inOut(Easing.ease);

export default function BrijoHead({ size }: Readonly<{ size: number }>) {
  const reduce = useReducedMotion();
  const enter = useSharedValue(0);
  const opacity = useSharedValue(0);
  const floatY = useSharedValue(0);
  const tilt = useSharedValue(-2.5);
  const sqX = useSharedValue(1);
  const sqY = useSharedValue(1);
  const blink = useSharedValue(0);

  useEffect(() => {
    opacity.set(withTiming(1, { duration: 250 }));
    if (reduce) {
      enter.set(1);
      tilt.set(0);
      return;
    }
    enter.set(withSpring(1, SPRING));
    floatY.set(withRepeat(
      withSequence(withTiming(-6, { duration: 1700, easing: ease }), withTiming(0, { duration: 1700, easing: ease })),
      -1,
    ));
    blink.set(withRepeat(
      withSequence(
        withDelay(3200, withTiming(1, { duration: 60 })),
        withDelay(140, withTiming(0, { duration: 60 })),
      ),
      -1,
    ));
    tilt.set(withRepeat(
      withSequence(withTiming(2.5, { duration: 3500, easing: ease }), withTiming(-2.5, { duration: 3500, easing: ease })),
      -1,
    ));
  }, [reduce, enter, opacity, floatY, tilt, blink]);

  const enterStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: 36 * (1 - enter.value) }, { scale: 0.7 + 0.3 * enter.value }],
  }));
  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }, { rotate: `${tilt.value}deg` }],
  }));
  const squishStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: sqX.value }, { scaleY: sqY.value }] }));

  const squish = (down: boolean) => {
    if (reduce) return;
    const cfg = { stiffness: 500, damping: 14 };
    sqX.set(withSpring(down ? 1.1 : 1, cfg));
    sqY.set(withSpring(down ? 0.9 : 1, cfg));
  };

  return (
    <Animated.View style={[{ width: size, height: size * HEAD_ASPECT, alignSelf: "center", flexShrink: 0 }, enterStyle]}>
      {/* gentle float + tilt for the whole (cropped) head */}
      <Animated.View style={[styles.fill, { transformOrigin: "50% 70%" }, floatStyle]}>
        <Pressable
          onPressIn={() => squish(true)}
          onPressOut={() => squish(false)}
          accessible={false}
          style={styles.fill}
        >
          <Animated.View style={[styles.fill, { transformOrigin: "50% 60%" }, squishStyle]}>
            <BrijoHeadArt width={size} blink={blink} />
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { width: "100%", height: "100%" },
});
