import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import BrijoHeadArt from "@/components/mascot/BrijoHeadArt";
import SplashBackdrop, { HOME_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import Avatar from "@/components/ui/Avatar";
import Panel from "@/components/ui/Panel";
import { StarIcon } from "@/components/ui/icons";
import { levelCount } from "@/data/levels";
import { leaderboardFor, type LeaderRow, type LeaderScope } from "@/data/leaderboard";
import BottomNav, { navigateToTab } from "@/features/home/components/BottomNav";
import MapTopBar from "@/features/home/components/MapTopBar";
import { useGuard } from "@/hooks/useGuard";
import { useActiveProfile } from "@/state/store";
import { colors, fonts } from "@/theme";

const SCOPES: { key: LeaderScope; label: string }[] = [
  { key: "class", label: "My class" },
  { key: "school", label: "My school" },
];

function Row({ row }: Readonly<{ row: LeaderRow }>) {
  return (
    <View
      style={[styles.row, row.isYou ? styles.rowYou : null]}
      accessible
      accessibilityLabel={`${row.isYou ? "You" : row.name}, ${row.stars} stars`}
    >
      <Text style={styles.rank}>{row.rank}</Text>
      <Avatar kind={row.avatar} size={40} />
      <Text style={[styles.rowName, row.isYou ? styles.rowNameYou : null]} numberOfLines={1}>
        {row.isYou ? `${row.name} (you)` : row.name}
      </Text>
      <StarIcon size={20} color={colors.atYellow} />
      <Text style={styles.rowStars}>{row.stars}</Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const ready = useGuard("profile");
  const profile = useActiveProfile();
  const [scope, setScope] = useState<LeaderScope>("class");
  const board = useMemo(() => (profile ? leaderboardFor(scope, profile) : null), [scope, profile]);
  if (!ready || !profile || !board) return <SplashBackdrop source={HOME_BACKGROUND} />;

  const toGo = Math.max(0, board.teamGoal - board.teamStars);
  const share = Math.min(1, board.teamStars / board.teamGoal);
  const done = profile.progress[profile.grade];
  const youShown = board.rows.some((r) => r.isYou);
  const group = scope === "class" ? "class" : "school";

  return (
    <SplashBackdrop source={HOME_BACKGROUND}>
      <MapTopBar />
      <ScrollView contentContainerStyle={[styles.body, { paddingTop: 16 }]} showsVerticalScrollIndicator={false}>
        <Panel style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>
            Scores
          </Text>

          <View style={styles.toggle} accessibilityRole="tablist">
            {SCOPES.map((s) => (
              <Pressable
                key={s.key}
                onPress={() => setScope(s.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: scope === s.key }}
                style={[styles.toggleBtn, scope === s.key ? styles.toggleOn : null]}
              >
                <Text style={[styles.toggleText, scope === s.key ? styles.toggleTextOn : null]}>{s.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.team}>
            <View style={styles.teamTop}>
              <BrijoHeadArt width={64} />
              <View style={styles.teamCopy}>
                <Text style={styles.teamTitle}>{`Our ${group} star goal`}</Text>
                <Text style={styles.teamLine}>
                  {toGo === 0 ? "We reached the goal together!" : `Together we have ${board.teamStars} stars. ${toGo} more to go!`}
                </Text>
              </View>
            </View>
            <View style={styles.bar} accessible accessibilityLabel={`${board.teamStars} of ${board.teamGoal} stars`}>
              <View style={[styles.barFill, { width: `${share * 100}%` }]} />
            </View>
            <Text style={styles.barLabel}>{`${board.teamStars} / ${board.teamGoal}`}</Text>
          </View>

          <View style={styles.mine}>
            <Avatar kind={profile.avatar} size={56} />
            <View style={styles.mineCopy}>
              <Text style={styles.mineTitle}>{`You added ${profile.stars} stars`}</Text>
              <Text style={styles.mineLine}>{`${done} of ${levelCount(profile.grade)} Grade ${profile.grade} levels done`}</Text>
            </View>
            <View style={styles.mineStars}>
              <StarIcon size={26} color={colors.atYellow} />
              <Text style={styles.mineStarsText}>{profile.stars}</Text>
            </View>
          </View>

          <Text style={styles.listTitle}>Star collectors</Text>
          <View style={styles.list}>
            {board.rows.map((r) => (
              <Row key={r.id} row={r} />
            ))}
            {youShown ? null : (
              <>
                <Text style={styles.dots}>⋮</Text>
                <Row row={board.you} />
              </>
            )}
          </View>
        </Panel>
      </ScrollView>
      <BottomNav active="score" onNavigate={navigateToTab} />
    </SplashBackdrop>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 16, paddingBottom: 120 },
  card: { width: "100%", maxWidth: 448, alignSelf: "center", alignItems: "stretch", gap: 14, paddingVertical: 24 },
  title: { fontFamily: fonts.headingBold, fontSize: 28, color: colors.atTeal, textAlign: "center" },
  toggle: { flexDirection: "row", backgroundColor: "#e3e9e8", borderRadius: 999, padding: 4 },
  toggleBtn: { flex: 1, minHeight: 48, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  toggleOn: { backgroundColor: colors.atTeal },
  toggleText: { fontFamily: fonts.bodyBold, fontSize: 16, color: "#5b6664" },
  toggleTextOn: { color: colors.white },
  team: { backgroundColor: colors.atCream, borderRadius: 20, borderWidth: 2, borderColor: colors.atYellow, padding: 14, gap: 10 },
  teamTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  teamCopy: { flex: 1, gap: 2 },
  teamTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.atTeal },
  teamLine: { fontFamily: fonts.bodySemiBold, fontSize: 16, lineHeight: 22, color: colors.atInk },
  bar: { height: 16, borderRadius: 8, backgroundColor: "#fff", borderWidth: 2, borderColor: colors.atYellow, overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: colors.atYellow },
  barLabel: { fontFamily: fonts.bodyBold, fontSize: 14, color: "#5b6664", textAlign: "right" },
  mine: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.atMint, borderRadius: 20, padding: 12 },
  mineCopy: { flex: 1, gap: 2 },
  mineTitle: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.atInk },
  mineLine: { fontFamily: fonts.bodyMedium, fontSize: 15, color: "#3c3c3c" },
  mineStars: { alignItems: "center" },
  mineStarsText: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.atInk },
  listTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.atInk, marginTop: 4 },
  list: { gap: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52, paddingHorizontal: 10, borderRadius: 14, backgroundColor: "#f6f8f8" },
  rowYou: { backgroundColor: colors.atYellowSoft, borderWidth: 2, borderColor: colors.atYellow },
  rank: { width: 24, fontFamily: fonts.bodyBold, fontSize: 16, color: "#5b6664", textAlign: "center" },
  rowName: { flex: 1, fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.atInk },
  rowNameYou: { fontFamily: fonts.bodyBold },
  rowStars: { minWidth: 28, fontFamily: fonts.bodyBold, fontSize: 16, color: colors.atInk, textAlign: "right" },
  dots: { fontFamily: fonts.bodyBold, fontSize: 18, color: "#9aa8a6", textAlign: "center" },
});
