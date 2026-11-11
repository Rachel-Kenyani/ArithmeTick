import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SplashBackdrop, {
  HOME_BACKGROUND,
} from "@/components/backdrops/SplashBackdrop";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import { BADGES, type BadgeDef } from "@/data/badges";
import BottomNav, { navigateToTab } from "@/features/home/components/BottomNav";
import MapTopBar from "@/features/home/components/MapTopBar";
import BadgeMedallion from "@/features/play/components/BadgeMedallion";
import { useGuard } from "@/hooks/useGuard";
import { useActiveProfile } from "@/state/store";
import { colors, fonts } from "@/theme";

const MEDAL = 84;

export default function BadgesScreen() {
  const ready = useGuard("profile");
  const profile = useActiveProfile();
  const [open, setOpen] = useState<BadgeDef | null>(null);
  if (!ready || !profile) return <SplashBackdrop source={HOME_BACKGROUND} />;

  const earned = new Set(profile.badges);
  const isEarned = (b: BadgeDef) => earned.has(b.id);
  const list = BADGES.filter(
    (b) => b.grade === undefined || b.grade === profile.grade,
  );
  const total = list.filter(isEarned).length;

  return (
    <SplashBackdrop source={HOME_BACKGROUND}>
      <MapTopBar onBadges />
      <ScrollView
        contentContainerStyle={[styles.body, { paddingTop: 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Panel style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>
            {`${profile.name}'s badges`}
          </Text>
          <Text style={styles.count}>{`${total} of ${list.length} won`}</Text>
          <View style={styles.bar} accessibilityElementsHidden>
            <View
              style={[
                styles.barFill,
                { width: `${(total / list.length) * 100}%` },
              ]}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{`Grade ${profile.grade}`}</Text>
            <View style={styles.grid}>
              {list.map((b) => {
                const won = isEarned(b);
                return (
                  <Pressable
                    key={b.id}
                    onPress={() => setOpen(b)}
                    accessibilityRole="button"
                    accessibilityLabel={`${b.name}. ${won ? "Won" : "Not won yet"}. Tap to see more`}
                    style={({ pressed }) => [
                      styles.tile,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <BadgeMedallion badge={b} earned={won} size={MEDAL} />
                    {won ? null : (
                      <View style={styles.lock}>
                        <Text style={styles.lockText}>?</Text>
                      </View>
                    )}
                    <Text
                      style={[styles.name, won ? null : styles.nameLocked]}
                      numberOfLines={2}
                    >
                      {b.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Panel>
      </ScrollView>
      <BottomNav active="badges" onNavigate={navigateToTab} />

      <Modal
        visible={open !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(null)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setOpen(null)}
          accessibilityLabel="Close"
        >
          {open ? (
            <Pressable
              style={styles.sheet}
              onPress={() => undefined}
              accessibilityViewIsModal
            >
              <BadgeMedallion badge={open} earned={isEarned(open)} size={150} />
              <Text style={styles.sheetTitle}>{open.name}</Text>
              <View
                style={[styles.chip, isEarned(open) ? styles.chipWon : null]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isEarned(open) ? styles.chipTextWon : null,
                  ]}
                >
                  {isEarned(open) ? "You won this!" : "Not won yet"}
                </Text>
              </View>
              <Text style={styles.about}>
                {isEarned(open) ? open.about : `To win it: ${open.how}.`}
              </Text>
              {isEarned(open) ? (
                <Text style={styles.how}>{open.how}</Text>
              ) : null}
              <Button onPress={() => setOpen(null)}>OK</Button>
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>
    </SplashBackdrop>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 16, paddingBottom: 120 },
  card: {
    width: "100%",
    maxWidth: 448,
    alignSelf: "center",
    alignItems: "stretch",
    gap: 10,
    paddingVertical: 24,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 28,
    color: colors.atTeal,
    textAlign: "center",
  },
  count: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.atPurple,
    textAlign: "center",
  },
  bar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e3e9e8",
    overflow: "hidden",
    marginHorizontal: 24,
  },
  barFill: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: colors.atYellow,
  },
  section: { gap: 10, marginTop: 14 },
  sectionTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: colors.atInk,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    rowGap: 16,
    columnGap: 8,
  },
  tile: { width: "31%", alignItems: "center", gap: 6, minHeight: 48 },
  pressed: { transform: [{ scale: 0.95 }] },
  lock: {
    position: "absolute",
    top: MEDAL / 2 - 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#8a9593",
    alignItems: "center",
    justifyContent: "center",
  },
  lockText: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.white },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.atInk,
    textAlign: "center",
  },
  nameLocked: { color: "#8a9593" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  sheetTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 26,
    color: colors.atTeal,
    textAlign: "center",
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: "#e3e9e8",
  },
  chipWon: { backgroundColor: colors.atYellow },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 15, color: "#5b6664" },
  chipTextWon: { color: colors.atInk },
  about: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.atInk,
    textAlign: "center",
  },
  how: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: "#5b6664",
    textAlign: "center",
  },
});
