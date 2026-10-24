/** "Grade complete! 🏆" — shown above the trail once all six levels of the grade are finished. */

import { useEffect } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import Panel from "@/components/ui/Panel";
import { StarIcon } from "@/components/ui/icons";
import { colors, fonts } from "@/theme";

export default function GradeCompleteCard({ gradeLabel }: Readonly<{ gradeLabel: string }>) {
  const reduceMotion = useReducedMotion();
  const sm = useWindowDimensions().width >= 640;

  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const scale = useSharedValue(reduceMotion ? 1 : 0.9);
  const y = useSharedValue(reduceMotion ? 0 : 12);
  const rot = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    const spring = { stiffness: 320, damping: 24 };
    opacity.set(withDelay(150, withSpring(1, spring)));
    scale.set(withDelay(150, withSpring(1, spring)));
    y.set(withDelay(150, withSpring(0, spring)));

    // Trophy wiggle: [0, -8, 8, -4, 0] over 1.1s, first after 0.6s, then every 3.5s.
    const seg = 1100 / 4;
    rot.set(
      withDelay(
        600,
        withRepeat(
          withSequence(
            withTiming(-8, { duration: seg }),
            withTiming(8, { duration: seg }),
            withTiming(-4, { duration: seg }),
            withTiming(0, { duration: seg }),
            withDelay(3500, withTiming(0, { duration: 0 })),
          ),
          -1,
        ),
      ),
    );
    return () => cancelAnimation(rot);
  }, [reduceMotion, opacity, scale, y, rot]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, opacity.value),
    transform: [{ translateY: y.value }, { scale: scale.value }],
  }));
  const trophyStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));

  return (
    <Animated.View style={[{ paddingHorizontal: sm ? 24 : 16, paddingTop: 20 }, cardStyle]}>
      <View accessible accessibilityLiveRegion="polite" accessibilityRole="summary">
        <Panel style={styles.panel}>
          <Animated.View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[styles.trophy, trophyStyle]}
          >
            <View style={styles.trophyEdge} />
            <View style={styles.trophyFace}>
              <Text style={styles.trophyEmoji}>🏆</Text>
            </View>
          </Animated.View>
          <View style={styles.text}>
            <Text accessibilityRole="header" style={[styles.title, { fontSize: sm ? 30 : 28 }]}>
              Grade complete!
            </Text>
            <Text style={[styles.body, { fontSize: sm ? 16 : 15 }]}>
              All 6 {gradeLabel} levels done. Play any level again!
            </Text>
            <View style={styles.stars} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {[0, 1, 2].map((i) => (
                <StarIcon key={i} size={18} fill="#ffd54a" stroke="#1b1b1b" strokeWidth={1.7} />
              ))}
            </View>
          </View>
        </Panel>
      </View>
    </Animated.View>
  );
}

const TROPHY = 72;

const styles = StyleSheet.create({
  panel: { flexDirection: "row", alignItems: "center", gap: 16, paddingTop: 20, paddingBottom: 20 },
  trophy: { width: TROPHY + 8, height: TROPHY + 8 + 5, flexShrink: 0 },
  trophyEdge: {
    position: "absolute",
    top: 5,
    left: 0,
    width: TROPHY + 8,
    height: TROPHY + 8,
    borderRadius: 999,
    backgroundColor: "#c99a1c",
  },
  trophyFace: {
    width: TROPHY + 8,
    height: TROPHY + 8,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: colors.white,
    backgroundColor: colors.jgSun,
    alignItems: "center",
    justifyContent: "center",
  },
  trophyEmoji: { fontSize: 42, lineHeight: 50 },
  text: { flexShrink: 1, minWidth: 0 },
  title: { fontFamily: fonts.headingBold, color: colors.atTeal },
  body: { marginTop: 4, fontFamily: fonts.bodyMedium, color: colors.jgOutline, lineHeight: 21 },
  stars: { marginTop: 6, flexDirection: "row", gap: 2 },
});
