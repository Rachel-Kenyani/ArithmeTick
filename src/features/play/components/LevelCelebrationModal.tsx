// TEMPORARY stand-in — replaced when LevelCelebrationModal is ported (see README).

import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";

import BadgeMedallion from "@/features/play/components/BadgeMedallion";
import RewardStars from "@/features/play/components/RewardStars";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import { sfx } from "@/services/audio";
import type { BadgeDef } from "@/data/badges";
import type { Grade } from "@/types/domain";
import { colors, fonts } from "@/theme";

export interface LevelCelebrationModalProps {
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

function Body({ levelNumber, badge, starsEarned, starsTotal, reduced, nextLabel, onHighFive, onClaim }: Readonly<Omit<LevelCelebrationModalProps, "open">>) {
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
      <Panel style={styles.panel}>
        <Text style={styles.title}>You did it!</Text>
        <Text style={styles.copy}>Level {levelNumber} is done!</Text>
        <RewardStars earned={starsEarned} total={starsTotal} reduced={reduced} />
        {badge ? (
          <View style={styles.badge}>
            <BadgeMedallion badge={badge} size={68} shine />
            <Text style={styles.badgeName}>{badge.name}</Text>
          </View>
        ) : null}
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
  panel: { gap: 14, minWidth: 280, maxWidth: 440 },
  title: { fontFamily: fonts.headingBold, fontSize: 34, color: colors.atTeal, textAlign: "center" },
  copy: { fontFamily: fonts.bodyMedium, fontSize: 18, color: colors.jgOutline, textAlign: "center" },
  badge: { alignItems: "center", gap: 6 },
  badgeName: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.atPurple },
});
