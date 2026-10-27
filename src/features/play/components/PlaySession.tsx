/**
 * PlaySession — one level, start to finish: top bar, the mat card with the level content, the
 * celebration, the High-Five Hero pop and the screen-time sheet. State lives in usePlaySession.
 */

import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeroPop from "@/features/play/components/HeroPop";
import LevelCelebrationModal from "@/features/play/components/LevelCelebrationModal";
import LevelContent from "@/features/play/components/LevelContent";
import ScreenTimeSheet from "@/features/play/components/ScreenTimeSheet";
import { usePlaySession } from "@/features/play/hooks/usePlaySession";
import { gutterFor } from "@/features/play/utils/playFormat";
import SplashBackdrop from "@/components/backdrops/SplashBackdrop";
import AppTopBar from "@/components/top-bar/AppTopBar";
import InfoBanner from "@/components/top-bar/InfoBanner";
import { LEVELS_PER_GRADE, type LevelDef } from "@/data/levels";
import type { ChildProfile } from "@/types/models";
import { GRADE_META } from "@/types/domain";
import { colors } from "@/theme";

export default function PlaySession({ profile, level }: Readonly<{ profile: ChildProfile; level: LevelDef }>) {
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const {
    secondsLeft,
    isQuest,
    levelNumber,
    palActive,
    engagePal,
    handleAttempt,
    completion,
    celebrating,
    timeUp,
    handleComplete,
    heroPop,
    handleHighFive,
    goHome,
  } = usePlaySession(profile, level);

  const meta = GRADE_META[profile.grade];
  const inert = celebrating || timeUp;
  const sm = width >= 640;
  const gutter = gutterFor(width);

  return (
    <SplashBackdrop>
      {/* inert behind the celebration / screen-time sheet: no stray taps or focus on the bar or the puzzle */}
      <View
        style={styles.shell}
        pointerEvents={inert ? "none" : "auto"}
        accessibilityElementsHidden={inert}
        importantForAccessibility={inert ? "no-hide-descendants" : "auto"}
      >
        {/* Same top bar and banner as Home, so the level screen feels like part of the map */}
        <AppTopBar backLabel="Back to map" onBack={goHome} stars={profile.stars} secondsLeft={secondsLeft} timePaused={isQuest} />
        <InfoBanner tag={`Level ${levelNumber}`} title={level.title} spoken={`Level ${levelNumber}: ${level.title}`} />

        <View
          style={[
            styles.main,
            {
              paddingTop: sm ? 16 : 12,
              paddingLeft: Math.max(gutter, insets.left),
              paddingRight: Math.max(gutter, insets.right),
              paddingBottom: insets.bottom + (sm ? 20 : 14),
            },
          ]}
        >
          <Animated.View
            accessibilityLabel={isQuest ? `Level ${levelNumber}: ${level.title}` : `Level ${levelNumber}: ${meta.mechanic} play area`}
            testID={`play-mat-g${profile.grade}-l${levelNumber}-pal-${palActive ? "on" : "off"}`}
            style={styles.mat}
            entering={reduced ? undefined : FadeIn.duration(300)}
          >
            <LevelContent level={level} palActive={palActive} onStruggle={engagePal} onAttempt={handleAttempt} onDone={handleComplete} />
          </Animated.View>
        </View>
      </View>

      <LevelCelebrationModal
        open={celebrating}
        grade={profile.grade}
        levelNumber={levelNumber}
        levelTitle={level.title}
        isQuest={isQuest}
        badge={completion?.newBadges[0] ?? null}
        starsEarned={completion?.starsEarned ?? 0}
        nextLabel={levelNumber >= LEVELS_PER_GRADE ? "Back to map" : "Next level"}
        starsTotal={profile.stars}
        reduced={reduced}
        onHighFive={handleHighFive}
        onClaim={goHome}
      />

      <HeroPop badge={celebrating ? heroPop : null} reduced={reduced} top={insets.top + 10} />

      {timeUp ? <ScreenTimeSheet onBack={goHome} reduced={reduced} /> : null}
    </SplashBackdrop>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, minHeight: 0 },
  main: { flex: 1, minHeight: 0, width: "100%", maxWidth: 1152, alignSelf: "center" },
  mat: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "rgba(0,79,74,0.2)",
    backgroundColor: colors.atMint,
  },
});
