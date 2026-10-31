/**
 * HeroPop — "+ High-Five Hero!" pop (above the celebration modal).
 */

import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut, withSpring, withTiming, type EntryExitAnimationFunction } from "react-native-reanimated";

import BadgeMedallion from "@/features/play/components/BadgeMedallion";
import type { BadgeDef } from "@/data/badges";
import { colors, fonts } from "@/theme";

/** Web: spring 480 / 18 from opacity 0, y −30, scale 0.6. */
const heroEntering: EntryExitAnimationFunction = () => {
  "worklet";
  const spring = { stiffness: 480, damping: 18 };
  return {
    initialValues: { opacity: 0, transform: [{ translateY: -30 }, { scale: 0.6 }] },
    animations: {
      opacity: withTiming(1, { duration: 200 }),
      transform: [{ translateY: withSpring(0, spring) }, { scale: withSpring(1, spring) }],
    },
  };
};

export default function HeroPop({ badge, reduced, top }: Readonly<{ badge: BadgeDef | null; reduced: boolean; top: number }>) {
  if (!badge) return null;
  return (
    <Animated.View
      key="hero-pop"
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[styles.heroWrap, { top }]}
      entering={reduced ? FadeIn : heroEntering}
      exiting={FadeOut.duration(reduced ? 200 : 250)}
    >
      <View style={styles.heroPill}>
        <BadgeMedallion badge={badge} size={48} shine />
        <Text style={styles.heroText}>+ {badge.name}!</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  heroWrap: { position: "absolute", left: 0, right: 0, zIndex: 65, alignItems: "center", paddingHorizontal: 16 },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 20,
    borderWidth: 4,
    borderColor: "#f3b3d2",
    shadowColor: "rgba(127,35,83,0.35)",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heroText: { fontFamily: fonts.headingBold, fontSize: 22, color: "#7f2353" },
});
