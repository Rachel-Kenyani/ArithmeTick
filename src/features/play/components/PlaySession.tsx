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
import PlayTopBar from "@/features/play/components/PlayTopBar";
import ScreenTimeSheet from "@/features/play/components/ScreenTimeSheet";
import { usePlaySession } from "@/features/play/hooks/usePlaySession";
import { gutterFor } from "@/features/play/utils/playFormat";
import SplashBackdrop from "@/components/backdrops/SplashBackdrop";
import type { LevelDef } from "@/data/levels";
import type { ChildProfile } from "@/types/models";
import { GRADE_META } from "@/types/domain";
import { colors } from "@/theme";

export default function PlaySession({ profile, level }: Readonly<{ profile: ChildProfile; level: LevelDef }>) {
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const {
    muted,
    secondsLeft,
    isQuest,
    levelNumber,
    palActive,
    engagePal,
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
        <PlayTopBar
          level={level}
          stars={profile.stars}
          secondsLeft={secondsLeft}
          timePaused={isQuest}
          muted={muted}
          reduced={reduced}
          onBack={goHome}
        />

        <View
          style={[
            styles.main,
            {
              paddingTop: sm ? 8 : 4,
              paddingLeft: Math.max(gutter, insets.left),
              paddingRight: Math.max(gutter, insets.right),
              paddingBottom: insets.bottom + (sm ? 20 : 14),
            },
          ]}
        >
          <Animated.View
            accessibilityLabel={isQuest ? `Level ${levelNumber}: Physical Quest` : `Level ${levelNumber}: ${meta.mechanic} play area`}
            testID={`play-mat-g${profile.grade}-l${levelNumber}-pal-${palActive ? "on" : "off"}`}
            style={styles.mat}
            entering={reduced ? undefined : FadeIn.duration(300)}
          >
            <LevelContent level={level} palActive={palActive} onStruggle={engagePal} onDone={handleComplete} />
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
