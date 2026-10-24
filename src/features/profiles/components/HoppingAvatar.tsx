/**
 * The child's avatar, which hops and bursts into sparkles when chosen.
 */

import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import Avatar from "@/components/ui/Avatar";
import type { ChildProfile } from "@/types/models";

import { easeOut } from "../utils/easing";
import Sparkle, { SPARKLES } from "./Sparkle";

export default function HoppingAvatar({
  child,
  size,
  hop,
}: Readonly<{
  child: ChildProfile;
  size: number;
  hop: boolean;
}>) {
  const y = useSharedValue(0);
  const rot = useSharedValue(0);
  useEffect(() => {
    if (!hop) return;
    const t = (ms: number) => ({ duration: ms, easing: easeOut });
    y.set(withSequence(withTiming(-16, t(225)), withTiming(0, t(225))));
    rot.set(
      withSequence(
        withTiming(-8, t(150)),
        withTiming(6, t(150)),
        withTiming(0, t(150)),
      ),
    );
  }, [hop, y, rot]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate: `${rot.value}deg` }],
  }));
  return (
    <View>
      <Animated.View style={style}>
        <Avatar kind={child.avatar} size={size} />
      </Animated.View>
      {hop
        ? SPARKLES.map((s, k) => <Sparkle key={`${s.x},${s.y}`} s={s} delay={k * 15} />)
        : null}
    </View>
  );
}
