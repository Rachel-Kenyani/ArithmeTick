/**
 * "You did them all, <name>!" (with a trophy) — a pop-up over the map once every level of the grade are finished (once per
 * visit, so the trail keeps its space). Shows the grade's finishing time — the seed of a future leaderboard.
 */

import { useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
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

import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import TrophyArt from "@/components/illustrations/TrophyArt";
import { StarIcon, StopwatchIcon } from "@/components/ui/icons";
import { colors, fonts } from "@/theme";

/** 412 → "6 min 52 s"; under a minute → "48 s". */
export function formatFinishTime(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const min = Math.floor(s / 60);
  return min > 0 ? `${min} min ${s % 60} s` : `${s} s`;
}

interface GradeCompleteCardProps {
  gradeLabel: string;
  childName: string;
  levelTotal: number;
  /** Seconds it took to finish the grade the first time (missing for grades finished before it was tracked). */
  finishSeconds?: number;
  visible: boolean;
  onClose: () => void;
}

export default function GradeCompleteCard({
  gradeLabel,
  levelTotal,
  finishSeconds,
  visible,
  onClose,
}: Readonly<GradeCompleteCardProps>) {
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
  const trophyStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            { paddingHorizontal: sm ? 24 : 16, width: "100%", maxWidth: 520 },
            cardStyle,
          ]}
        >
          <View
            accessible
            accessibilityLiveRegion="polite"
            accessibilityRole="summary"
          >
            <Panel style={styles.panel}>
              <Animated.View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[styles.trophy, trophyStyle]}
              >
                <View style={styles.trophyEdge} />
                <View style={styles.trophyFace}>
                  <TrophyArt size={50} />
                </View>
              </Animated.View>
              <View style={styles.text}>
                <Text
                  accessibilityRole="header"
                  style={[styles.title, { fontSize: sm ? 30 : 28 }]}
                >
                  You did them all!
                </Text>
                <Text style={[styles.body, { fontSize: sm ? 20 : 18 }]}>
                  All {levelTotal} {gradeLabel} levels are done.
                </Text>
                {finishSeconds ? (
                  <View
                    accessible
                    style={styles.timeRow}
                    accessibilityLabel={`Finished in ${formatFinishTime(finishSeconds)}`}
                  >
                    <StopwatchIcon size={18} color={colors.atPurple} strokeWidth={2.4} />
                    <Text style={styles.time}>
                      Finished in {formatFinishTime(finishSeconds)}
                    </Text>
                  </View>
                ) : null}
                <View
                  style={styles.stars}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  {[0, 1, 2].map((i) => (
                    <StarIcon
                      key={i}
                      size={40}
                      fill="#ffd54a"
                      stroke="#1b1b1b"
                      strokeWidth={1.7}
                    />
                  ))}
                </View>
              </View>
              <Button onPress={onClose} style={styles.close}>
                Play any level again!
              </Button>
            </Panel>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const TROPHY = 72;

const styles = StyleSheet.create({
  panel: {
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
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
  text: { flexShrink: 1, minWidth: 0 },
  title: {
    fontFamily: fonts.headingBold,
    color: colors.atTeal,
    textAlign: "center",
  },
  body: {
    marginTop: 4,
    fontFamily: fonts.bodyMedium,
    color: colors.jgOutline,
    lineHeight: 21,
    textAlign: "center",
  },
  stars: {
    marginTop: 6,
    flexDirection: "row",
    gap: 2,
    justifyContent: "center",
  },
  timeRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  time: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.atPurple,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,40,37,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  close: { marginTop: 14 },
});
