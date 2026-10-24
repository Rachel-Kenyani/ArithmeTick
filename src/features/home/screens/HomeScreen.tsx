/**
 * /home — the child's level map (docs/APP-SHELL.md §5 "Home").
 *
 * A fixed, full-height app shell over the jungle backdrop:
 *   top bar (explorer switcher · stars · screen time) → grade banner → scrolling trail → bottom tab bar
 *   (Map · Badges · Score)
 * Only the trail scrolls, so the jungle, the header and the tab bar stay put, and the trail's last stops can never
 * slip behind the tab bar.
 */

import { useCallback, useEffect } from "react";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";

import GradeCompleteCard from "@/features/home/components/GradeCompleteCard";
import GradeBanner from "@/features/home/components/header/GradeBanner";
import HomeTopBar from "@/features/home/components/header/HomeTopBar";
import LevelMap from "@/features/home/components/level-map/LevelMap";
import BottomNav from "@/features/home/components/BottomNav";
import StatusBarScrim from "@/features/home/components/StatusBarScrim";
import { useMapAutoScroll } from "@/features/home/hooks/useMapAutoScroll";
import { useMapUnlock } from "@/features/home/hooks/useMapUnlock";
import { useNavigateOnce } from "@/features/home/hooks/useNavigateOnce";
import SplashBackdrop, { HOME_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import { levelsForGrade, LEVELS_PER_GRADE, type LevelDef } from "@/data/levels";
import type { ChildProfile } from "@/types/models";
import { ROUTES } from "@/constants/routes";
import { actions, useActiveProfile, useScreenTimeRemaining } from "@/state/store";
import { GRADE_META } from "@/types/domain";
import { useGuard } from "@/hooks/useGuard";

/** Short landscape screens (a phone held sideways): the banner scrolls with the trail instead of eating its height. */
const SHORT_SCREEN_MAX_HEIGHT = 520;

export default function HomePage() {
  const ready = useGuard("profile");
  const profile = useActiveProfile();

  useEffect(() => {
    actions.ensureToday();
  }, []);

  if (!ready || !profile) return <SplashBackdrop source={HOME_BACKGROUND} />;
  return <HomeScreen profile={profile} />;
}

function HomeScreen({ profile }: Readonly<{ profile: ChildProfile }>) {
  const secondsLeft = useScreenTimeRemaining();
  const { height } = useWindowDimensions();
  const shortScreen = height <= SHORT_SCREEN_MAX_HEIGHT;
  const focused = useIsFocused();

  const grade = profile.grade;
  const levels = levelsForGrade(grade);
  const completed = Math.min(profile.progress[grade] ?? 0, LEVELS_PER_GRADE);
  const allDone = completed >= LEVELS_PER_GRADE;

  const { unlockLevel, mapEpoch } = useMapUnlock(grade, completed, focused);

  const go = useNavigateOnce();
  const handlePlay = useCallback((level: LevelDef) => go(ROUTES.play(level.number)), [go]);
  const handleUnlockDone = useCallback(() => actions.clearJustUnlocked(), []);

  const { scrollRef, regionHeight, handleRegionLayout, handleMapLayout, handleFocusY } = useMapAutoScroll(allDone);

  const banner = <GradeBanner grade={grade} completed={completed} total={levels.length} />;

  return (
    <SplashBackdrop source={HOME_BACKGROUND}>
      {/* Dark clock/battery: the light status bar text is unreadable on the pale meadow */}
      {focused ? <StatusBar style="dark" /> : null}
      {/* No art behind the clock / battery */}
      <StatusBarScrim />
      <View style={styles.shell}>
        <View style={styles.header}>
          <HomeTopBar profile={profile} secondsLeft={secondsLeft} onSwitchExplorer={() => go(ROUTES.profiles)} />
          {shortScreen ? null : banner}
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          onLayout={handleRegionLayout}
          overScrollMode="never"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View accessibilityLabel="Level map" style={styles.section}>
            {/* Short landscape screens: the banner scrolls with the trail instead of eating the map's height. */}
            {shortScreen ? banner : null}
            {allDone ? <GradeCompleteCard gradeLabel={GRADE_META[grade].shortLabel} /> : null}
            <View onLayout={handleMapLayout}>
              <LevelMap
                key={`${profile.id}-${grade}-${mapEpoch}`}
                levels={levels}
                completed={completed}
                regionHeight={regionHeight}
                onFocusY={handleFocusY}
                unlockLevel={unlockLevel}
                onUnlockDone={handleUnlockDone}
                onPlay={handlePlay}
              />
            </View>
          </View>
        </ScrollView>

        <BottomNav active="map" onNavigate={go} />
      </View>
    </SplashBackdrop>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, minHeight: 0 },
  header: { zIndex: 20, flexShrink: 0 },
  scroll: { flex: 1, minHeight: 0 },
  scrollContent: { flexGrow: 1 },
  section: { flexGrow: 1, width: "100%", maxWidth: 512, alignSelf: "center", justifyContent: "flex-end" },
});
