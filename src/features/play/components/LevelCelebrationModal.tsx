import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { QuestTaskPicture, hasQuestTaskArt } from "@/components/illustrations/QuestTaskArt";
import TreasureGroup from "@/features/play/components/TreasureGroup";
import type { StoryStop } from "@/data/stories";
import BadgeMedallion from "@/features/play/components/BadgeMedallion";
import RewardStars from "@/features/play/components/RewardStars";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import SpokenText from "@/components/ui/SpokenText";
import { sfx } from "@/services/audio";
import { narration } from "@/services/narration";
import { CHEERS } from "@/services/voiceClips";
import type { BadgeDef } from "@/data/badges";
import type { Grade } from "@/types/domain";
import { colors, fonts } from "@/theme";

export interface LevelCelebrationModalProps {
  childName: string;
  treasure: StoryStop | null;
  treasureCount: number;
  open: boolean;
  grade: Grade;
  levelNumber: number;
  levelTitle: string;
  isQuest: boolean;
  questTask?: string;
  badge: BadgeDef | null;
  starsEarned: number;
  starsTotal: number;
  reduced: boolean;
  onHighFive?: () => void;
  nextLabel: string;
  onClaim: () => void;
}

export default function LevelCelebrationModal({ open, ...rest }: Readonly<LevelCelebrationModalProps>) {
  if (!open) return null;
  return <Body {...rest} />;
}

const MAX_HERO_TREASURES = 40;

function heroCount(count: number): number {
  return count > MAX_HERO_TREASURES ? 1 : count;
}

function heroSize(count: number): number {
  if (count > MAX_HERO_TREASURES) return 64;
  return count > 10 ? 26 : 34;
}

function Body({ childName, treasure, treasureCount, questTask, grade, levelNumber, badge, starsEarned, starsTotal, reduced, nextLabel, onHighFive, onClaim }: Readonly<Omit<LevelCelebrationModalProps, "open">>) {
  const claimedRef = useRef(false);

  const highFive = useRef(onHighFive);
  useEffect(() => {
    sfx.clap();
    highFive.current?.();
  }, []);

  const missionLine = treasure ? treasure.done(treasureCount) : null;
  const [cheer] = useState(() => CHEERS[Math.floor(Math.random() * CHEERS.length)]);
  const doneLine = missionLine ? `${missionLine} ${cheer.text}` : null;
  useEffect(() => {
    if (!missionLine) return;
    const timer = setTimeout(() => narration.done(missionLine, cheer, grade, levelNumber), 700);
    return () => {
      clearTimeout(timer);
      narration.stop();
    };
  }, [missionLine, cheer, grade, levelNumber]);

  const claim = () => {
    if (claimedRef.current) return;
    claimedRef.current = true;
    sfx.sparkle();
    onClaim();
  };

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]} accessibilityViewIsModal>
      <View style={[StyleSheet.absoluteFill, styles.scrim]} />
      <Panel style={styles.panel}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{`Level ${levelNumber} done`}</Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {`You did it, ${childName}!`}
        </Text>

        {treasure ? (
          <View style={styles.hero} accessible accessibilityLabel={doneLine ?? undefined}>
            {hasQuestTaskArt(questTask) ? (
              <QuestTaskPicture task={questTask} size={96} />
            ) : (
              <TreasureGroup id={treasure.treasure} count={heroCount(treasureCount)} size={heroSize(treasureCount)} animate={!reduced} />
            )}
            {doneLine ? <SpokenText text={doneLine} style={styles.heroText} /> : null}
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
