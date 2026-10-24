// TEMPORARY stand-in — replaced when LevelCelebrationModal is ported (see README).

import { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";

import BadgeMedallion from "@/features/play/components/BadgeMedallion";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import { sfx } from "@/services/audio";
import type { BadgeDef } from "@/data/badges";
import { GRADE_META, type Grade } from "@/types/domain";
import { colors, fonts } from "@/theme";

export interface LevelCelebrationModalProps {
  open: boolean;
  grade: Grade;
  /** 1-based level number on the grade map. */
  levelNumber: number;
  /** The level's map title, e.g. "Make 6" (lib/levels.ts). */
  levelTitle: string;
  isQuest: boolean;
  /** Newly earned badge to feature, or null → a "Level n complete!" card. */
  badge: BadgeDef | null;
  /** The child gave a real high-five (called once per opening, on the first tap of the hand). */
  onHighFive?: () => void;
  onClaim: () => void;
}

export default function LevelCelebrationModal({ open, ...rest }: Readonly<LevelCelebrationModalProps>) {
  if (!open) return null;
  return <Body {...rest} />;
}

function Body({ grade, levelNumber, levelTitle, isQuest, badge, onHighFive, onClaim }: Readonly<Omit<LevelCelebrationModalProps, "open">>) {
  const fivedRef = useRef(false);
  const claimedRef = useRef(false);

  const highFive = () => {
    sfx.clap();
    if (fivedRef.current) return;
    fivedRef.current = true;
    onHighFive?.();
  };
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
        <Text style={styles.title}>Awesome Job!</Text>
        <Text style={styles.copy}>
          {GRADE_META[grade].shortLabel} · Level {levelNumber}: {isQuest ? "Physical Quest" : levelTitle} complete!
        </Text>
        {badge ? (
          <View style={styles.badge}>
            <BadgeMedallion badge={badge} size={68} shine />
            <Text style={styles.badgeName}>{badge.name}</Text>
          </View>
        ) : null}
        <Button variant="purple" onPress={highFive}>
          High-five!
        </Button>
        <Button variant="teal" trailing="chevron" onPress={claim}>
          Claim Star &amp; Next Mission
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
