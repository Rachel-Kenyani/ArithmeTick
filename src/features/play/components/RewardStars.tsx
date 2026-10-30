/**
 * RewardStars — the stars a level just earned, popping in one by one (a rising "snap" note each), with the
 * explorer's star total counting up beside them. No tap needed: the stars are already saved when the
 * level is solved; this only shows it. Under reduced motion everything appears at once, without sounds.
 * On a replay (earned 0) the 3 stars show as already won and the total stays the same.
 */

import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

import { StarIcon } from "@/components/ui/icons";
import { sfx } from "@/services/audio";
import { colors, fonts } from "@/theme";

/** First pop after the card has settled, then one star every STEP_MS. */
const FIRST_MS = 350;
const STEP_MS = 320;
const STAR_IDS = ["s1", "s2", "s3"] as const;

export default function RewardStars({ earned, total, reduced }: Readonly<{ earned: number; total: number; reduced: boolean }>) {
  const count = Math.min(earned, STAR_IDS.length);
  const replay = count === 0;
  const [shown, setShown] = useState(reduced ? count : 0);

  useEffect(() => {
    if (reduced) return;
    const timers = STAR_IDS.slice(0, count).map((_, i) =>
      setTimeout(() => {
        setShown(i + 1);
        sfx.snap(i + 2);
      }, FIRST_MS + i * STEP_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [count, reduced]);

  const spoken = replay
    ? `You already won these stars. You have ${total} stars.`
    : `You won ${earned} ${earned === 1 ? "star" : "stars"}. You have ${total} stars now.`;
  return (
    <View style={styles.wrap} accessible accessibilityLabel={spoken}>
      <View style={styles.row}>
        {STAR_IDS.map((id, i) => (
          <View key={id} style={styles.slot}>
            {replay || i < shown ? (
              <Animated.View entering={reduced || replay ? undefined : ZoomIn.springify().stiffness(420).damping(12)}>
                <StarIcon size={52} fill="#ffd54a" stroke="#1b1b1b" strokeWidth={1.4} />
              </Animated.View>
            ) : (
              <StarIcon size={52} fill="rgba(0,79,74,0.08)" stroke="rgba(0,79,74,0.2)" strokeWidth={1.4} />
            )}
          </View>
        ))}
      </View>
      {replay ? <Text style={styles.note}>You already won these stars!</Text> : null}
      <View style={styles.totalPill}>
        <StarIcon size={20} fill="#ffd54a" stroke="#1b1b1b" strokeWidth={1.7} />
        <Text style={styles.totalText}>{total - count + shown}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 10 },
  row: { flexDirection: "row", gap: 8 },
  slot: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  // Same purple pill as the top bar's star counter, so kids see where the stars went
  totalPill: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: colors.atPurple,
    paddingLeft: 10,
    paddingRight: 14,
  },
  note: { fontFamily: fonts.bodySemiBold, fontSize: 18, color: colors.atTeal, textAlign: "center" },
  totalText: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.white, fontVariant: ["tabular-nums"] },
});
