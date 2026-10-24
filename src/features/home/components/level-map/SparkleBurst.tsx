/** The sparkle burst + white flash played over a stop as it unlocks. */

import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { SparkleIcon } from "@/components/ui/icons";

const BURST_COLORS = ["#ffd54a", "#ffffff", "#7ff0c9", "#9b75cc", "#ffd54a", "#ffffff", "#2fa79e", "#ffe58a"];
/** One entry per sparkle slot around the burst ring; the slot (its angle) is the sparkle's identity. */
const BURST_SLOTS = BURST_COLORS.map((_, i) => ({ id: `slot-${i}`, i }));
const easeOut = Easing.out(Easing.ease);

function BurstSparkle({ i, radius }: Readonly<{ i: number; radius: number }>) {
  const angle = (i / BURST_COLORS.length) * Math.PI * 2 - Math.PI / 2;
  const dist = radius * (i % 2 === 0 ? 1.15 : 0.9);
  const size = i % 2 === 0 ? 24 : 18;
  const t = useSharedValue(0);
  const scale = useSharedValue(0);
  useEffect(() => {
    const delay = (i % 2) * 60;
    t.set(withDelay(delay, withTiming(1, { duration: 950, easing: easeOut })));
    scale.set(
      withDelay(
        delay,
        withSequence(
          withTiming(1.15, { duration: 475, easing: easeOut }),
          withTiming(0, { duration: 475, easing: easeOut }),
        ),
      ),
    );
  }, [i, t, scale]);
  const animated = useAnimatedStyle(() => ({
    transform: [
      { translateX: Math.cos(angle) * dist * t.value },
      { translateY: Math.sin(angle) * dist * t.value },
      { rotate: `${120 * t.value}deg` },
      { scale: scale.value },
    ],
  }));
  return (
    <Animated.View style={[{ position: "absolute", left: -size / 2, top: -size / 2 }, animated]}>
      <SparkleIcon size={size} color={BURST_COLORS[i]} fill="currentColor" stroke="#1b1b1b" strokeWidth={1.2} />
    </Animated.View>
  );
}

export default function SparkleBurst({ x, y, radius }: Readonly<{ x: number; y: number; radius: number }>) {
  const flash = useSharedValue(0);
  useEffect(() => {
    flash.set(withTiming(1, { duration: 600, easing: easeOut }));
  }, [flash]);
  const flashStyle = useAnimatedStyle(() => ({
    opacity: 0.85 * (1 - flash.value),
    transform: [{ scale: 0.6 + flash.value }],
  }));
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: x, top: y, zIndex: 30 }}>
      {BURST_SLOTS.map((slot) => (
        <BurstSparkle key={slot.id} i={slot.i} radius={radius} />
      ))}
      <Animated.View
        style={[
          { position: "absolute", left: -radius, top: -radius, width: radius * 2, height: radius * 2, borderRadius: radius, backgroundColor: "#ffffff" },
          flashStyle,
        ]}
      />
    </View>
  );
}
