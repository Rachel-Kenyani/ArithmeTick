// TEMPORARY stand-in — replaced when LevelCelebrationModal is ported (see README).

import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";

import TreasureGroup from "@/features/play/components/TreasureGroup";
import type { StoryStop } from "@/data/stories";
import BadgeMedallion from "@/features/play/components/BadgeMedallion";
import RewardStars from "@/features/play/components/RewardStars";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import { sfx } from "@/services/audio";
import type { BadgeDef } from "@/data/badges";
import type { Grade } from "@/types/domain";
import { colors, fonts } from "@/theme";

export interface LevelCelebrationModalProps {
  /** The child's name: "You did it, Amani!" */
  childName: string;
  /** The level's story stop: its treasure is shown as found. */
  treasure: StoryStop | null;
  /** How many treasures the level brings back (the number the child built). */
  treasureCount: number;
  open: boolean;
  grade: Grade;
  /** 1-based level number on the grade map. */
  levelNumber: number;
  /** The level's child-facing map title, e.g. "Count to 6" (data/levels.ts). */
  levelTitle: string;
  isQuest: boolean;
  /** Newly earned badge to feature, or null → a "Level n complete!" card. */
  badge: BadgeDef | null;
  /** Stars this level just added (3 the first time, 0 on a replay; already saved), and the new total. */
  starsEarned: number;
  starsTotal: number;
  reduced: boolean;
  /** The celebration's high-five, counted automatically once per opening (feeds the High-Five Hero badge). */
  onHighFive?: () => void;
  /** Label for the main button: "Next level", or "Back to map" after the grade's last level. */
  nextLabel: string;
  onClaim: () => void;
}

export default function LevelCelebrationModal({ open, ...rest }: Readonly<LevelCelebrationModalProps>) {
  if (!open) return null;
  return <Body {...rest} />;
}

function Body({ childName, treasure, treasureCount, levelNumber, badge, starsEarned, starsTotal, reduced, nextLabel, onHighFive, onClaim }: Readonly<Omit<LevelCelebrationModalProps, "open">>) {
  const claimedRef = useRef(false);

  // The pop-up opens with a clap sound: no button to find, it just happens (once per opening).
  const highFive = useRef(onHighFive);
  useEffect(() => {
    sfx.clap();
    highFive.current?.();
  }, []);

  const claim = () => {
    if (claimedRef.current) return;
    claimedRef.current = true;
    sfx.sparkle();
    onClaim();
  };

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]} accessibilityViewIsModal>
      <View style={[StyleSheet.absoluteFill, styles.scrim]} />
      {/*
        Hierarchy: who + what (title) → the story payoff (hero card) → rewards (stars, badge) → next step.
        Each group sits in its own band so nothing floats.
      */}
      <Panel style={styles.panel}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{`Level ${levelNumber} done`}</Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {`You did it, ${childName}!`}
        </Text>

        {treasure ? (
          <View style={styles.hero} accessible accessibilityLabel={`${treasure.done(treasureCount)} Thank you, ${childName}!`}>
            <TreasureGroup id={treasure.treasure} count={treasureCount} size={treasureCount > 10 ? 26 : 34} animate={!reduced} />
            <Text style={styles.heroText}>{`${treasure.done(treasureCount)} Thank you, ${childName}!`}</Text>
          </View>
        ) : null}

        <View style={styles.rewards}>
          <RewardStars earned={starsEarned} total={starsTotal} reduced={reduced} />
          {badge ? (
            <View style={styles.badge}>
              <BadgeMedallion badge={badge} size={56} shine />
              <View style={styles.badgeText}>
                <Text style={styles.badgeKicker}>New badge!</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <Button variant="teal" trailing="chevron" onPress={claim}>
          {nextLabel}
        </Button>
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { zIndex: 60, alignItems: "center", justifyContent: "center", padding: 16 },
  scrim: { backgroundColor: "rgba(0,79,74,0.6)" },
  panel: { gap: 16, minWidth: 280, maxWidth: 440, alignSelf: "stretch", alignItems: "stretch" },
  tag: { alignSelf: "center", backgroundColor: colors.atPurple, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3 },
  tagText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.white },
  title: { fontFamily: fonts.headingBold, fontSize: 32, lineHeight: 38, color: colors.atTeal, textAlign: "center", marginTop: -6 },
  hero: { alignItems: "center", gap: 10, backgroundColor: colors.atMint, borderRadius: 20, borderWidth: 2, borderColor: colors.atMintDeep, paddingVertical: 14, paddingHorizontal: 12 },
  heroText: { fontFamily: fonts.headingBold, fontSize: 18, lineHeight: 24, color: colors.atInk, textAlign: "center" },
  rewards: { alignItems: "center", gap: 12 },
  badge: { flexDirection: "row", alignItems: "center", alignSelf: "stretch", gap: 12, backgroundColor: colors.white, borderRadius: 18, borderWidth: 2, borderColor: colors.atMintDeep, padding: 10 },
  badgeText: { flexShrink: 1 },
  badgeKicker: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.jgOutline },
  badgeName: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.atPurple },
});
