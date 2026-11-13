import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import SplashBackdrop, { HOME_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import Avatar from "@/components/ui/Avatar";
import { GROWN_UP } from "@/components/ui/GrownUpNote";
import HoldToConfirm from "@/components/ui/HoldToConfirm";
import Panel from "@/components/ui/Panel";
import { LeafIcon, MapIcon, MedalIcon, StarIcon } from "@/components/ui/icons";
import { ROUTES } from "@/constants/routes";
import { FAMILY_GOAL_STEP, PERSONAL_GOAL_STEP, journeyOf, starGoal, type StarGoal } from "@/data/family";
import BottomNav, { navigateToTab } from "@/features/home/components/BottomNav";
import HeroBanner, { HeroCallout } from "@/features/home/components/HeroBanner";
import MapTopBar from "@/features/home/components/MapTopBar";
import { useGuard } from "@/hooks/useGuard";
import { useActiveProfile, useAppState } from "@/state/store";
import { colors, fonts } from "@/theme";
import { MAX_PROFILES, type ChildProfile } from "@/types/models";

export default function LeaderboardScreen() {
  const ready = useGuard("profile");
  const profile = useActiveProfile();
  const { profiles } = useAppState();
  if (!ready || !profile) return <SplashBackdrop source={HOME_BACKGROUND} />;

  const family = profiles.length > 1;
  const goal = family ? starGoal(profiles, FAMILY_GOAL_STEP) : starGoal([profile], PERSONAL_GOAL_STEP);

  return (
    <SplashBackdrop source={HOME_BACKGROUND}>
      <MapTopBar />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <GoalHero goal={goal} family={family} name={profile.name} />
        {family ? <FamilyBoard profiles={profiles} activeId={profile.id} /> : null}
        <JourneyCard child={profile} />
        {!family && profiles.length < MAX_PROFILES ? (
          <View style={styles.grownUp}>
            <Text style={styles.grownUpText}>{`Add a brother or sister to share a family star goal with ${profile.name}.`}</Text>
            <HoldToConfirm label="Grown-ups: hold to add a child" onConfirm={() => router.push(ROUTES.addExplorer as never)} />
          </View>
        ) : null}
      </ScrollView>
      <BottomNav active="score" onNavigate={navigateToTab} />
    </SplashBackdrop>
  );
}

function GoalHero({ goal, family, name }: Readonly<{ goal: StarGoal; family: boolean; name: string }>) {
  const toGo = goal.goal - goal.stars;
  let subtitle = `${toGo} more ${toGo === 1 ? "star" : "stars"} to the next goal`;
  if (goal.complete) subtitle = family ? "Your family won every star!" : "You won every star!";
  return (
    <HeroBanner
      title={family ? "Family Stars" : `${name}'s Stars`}
      subtitle={subtitle}
      value={goal.stars}
      total={goal.goal}
      ringLabel={`${goal.stars} of ${goal.goal} stars`}
    >
      <HeroCallout
        label={family ? "OUR FAMILY STAR GOAL" : "MY STAR GOAL"}
        title={reachedLine(goal.reached)}
        detail={`A new goal every ${family ? FAMILY_GOAL_STEP : PERSONAL_GOAL_STEP} stars`}
        accessibilityLabel={`${reachedLine(goal.reached)}. A new goal every ${family ? FAMILY_GOAL_STEP : PERSONAL_GOAL_STEP} stars`}
      />
    </HeroBanner>
  );
}

function CardHead({ title, note, count }: Readonly<{ title: string; note: string; count: string }>) {
  return (
    <View style={styles.cardHead}>
      <View style={styles.cardTitles}>
        <Text accessibilityRole="header" style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardNote}>{note}</Text>
      </View>
      <View style={styles.countChip}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );
}

function reachedLine(reached: number): string {
  if (reached === 0) return "First goal coming up";
  return `${reached} ${reached === 1 ? "goal" : "goals"} reached`;
}

function FamilyBoard({ profiles, activeId }: Readonly<{ profiles: readonly ChildProfile[]; activeId: string }>) {
  return (
    <Panel style={styles.card}>
      <CardHead title="Our explorers" note="Every star counts for the family" count={`${profiles.length}`} />
      <View style={styles.list}>
        {profiles.map((p) => {
          const you = p.id === activeId;
          return (
            <View key={p.id} style={[styles.row, you ? styles.rowYou : null]} accessible accessibilityLabel={`${p.name}${you ? ", playing now" : ""}. Grade ${p.grade}. ${p.stars} stars, ${p.badges.length} badges`}>
              <Avatar kind={p.avatar} size={44} />
              <View style={styles.rowCopy}>
                <Text style={[styles.rowName, you ? styles.rowNameYou : null]} numberOfLines={1}>
                  {you ? `${p.name} (you)` : p.name}
                </Text>
                <Text style={styles.rowGrade}>{`Grade ${p.grade}`}</Text>
              </View>
              <View style={styles.stat}>
                <MedalIcon size={18} color={colors.atPurple} />
                <Text style={styles.statText}>{p.badges.length}</Text>
              </View>
              <View style={styles.stat}>
                <StarIcon size={20} color={colors.atYellow} />
                <Text style={styles.statText}>{p.stars}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Panel>
  );
}

function JourneyCard({ child }: Readonly<{ child: ChildProfile }>) {
  const j = journeyOf(child);
  const tiles = [
    { id: "levels", Icon: MapIcon, tint: colors.atTeal, value: `${j.levelsDone}/${j.levels}`, label: `Grade ${child.grade} levels` },
    { id: "badges", Icon: MedalIcon, tint: colors.atPurple, value: `${j.badgesWon}/${j.badges}`, label: "Badges won" },
    { id: "quests", Icon: LeafIcon, tint: "#4f7d17", value: String(j.questsDone), label: "Move & Play done" },
    { id: "days", Icon: StarIcon, tint: "#d9a400", value: String(j.daysPlayed), label: j.daysPlayed === 1 ? "Day played" : "Days played" },
  ];
  return (
    <Panel style={styles.card}>
      <CardHead title={`${child.name}'s journey`} note={`Grade ${child.grade}`} count={`${j.levelsDone}/${j.levels}`} />
      <View style={styles.tiles}>
        {tiles.map((t) => (
          <View key={t.id} style={styles.tile} accessible accessibilityLabel={`${t.label}: ${t.value}`}>
            <t.Icon size={22} color={t.tint} />
            <Text style={styles.tileValue}>{t.value}</Text>
            <Text style={styles.tileLabel}>{t.label}</Text>
          </View>
        ))}
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120, gap: 14, width: "100%", maxWidth: 480, alignSelf: "center" },
  card: { width: "100%", alignItems: "stretch", gap: 14, paddingVertical: 18 },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  cardTitles: { flexShrink: 1, gap: 2 },
  cardTitle: { fontFamily: fonts.headingBold, fontSize: 21, color: colors.atTeal },
  cardNote: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: "#5b6664" },
  countChip: { borderRadius: 999, backgroundColor: colors.atYellowSoft, paddingHorizontal: 12, paddingVertical: 4 },
  countText: { fontFamily: fonts.headingBold, fontSize: 16, color: colors.atInk },

  list: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 60, paddingHorizontal: 10, borderRadius: 16, backgroundColor: "#f6f8f8" },
  rowYou: { backgroundColor: colors.atYellowSoft, borderWidth: 2, borderColor: colors.atYellow },
  rowCopy: { flex: 1 },
  rowName: { fontFamily: fonts.bodySemiBold, fontSize: 17, color: colors.atInk },
  rowNameYou: { fontFamily: fonts.bodyBold },
  rowGrade: { fontFamily: fonts.bodyMedium, fontSize: 13, color: "#5b6664" },
  stat: { flexDirection: "row", alignItems: "center", gap: 3, minWidth: 44, justifyContent: "flex-end" },
  statText: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.atInk },

  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { flexGrow: 1, flexBasis: "45%", alignItems: "center", gap: 2, paddingVertical: 12, borderRadius: 18, backgroundColor: colors.atMint },
  tileValue: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.atInk },
  tileLabel: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: "#5b6664", textAlign: "center" },

  grownUp: { alignItems: "stretch", gap: 12, padding: 14, borderRadius: 20, borderWidth: 2, backgroundColor: GROWN_UP.bg, borderColor: GROWN_UP.border },
  grownUpText: { flex: 1, fontFamily: fonts.headingBold, fontSize: 16, lineHeight: 21, color: GROWN_UP.ink },
});
