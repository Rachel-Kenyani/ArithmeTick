/**
 * Splash intro — Figma frames 1–14 of the 14-frame splash animation.
 *
 *   1  the full logo (owl + "arithmetick" wordmark) centred on the teal triangle pattern   (Logo-splash-1)
 *   2  the wordmark drops away; the owl alone sits at the exact centre of the screen       (Logo-splash-2-&-3)
 *   3  the owl sinks 29px below the vertical centre
 *   4  the owl, enlarged, at the horizontal & vertical centre                               (Logo-splash-4-6-7-&-8)
 *   5  the owl blinks — pupils gone for a beat                                              (Logo-splash-5)
 *   6  eyes open again, and the teal pattern cross-fades to the sky gradient                (sky-background)
 *   7  the head floats up (centre at 37% of the screen height)
 *   8  the head slides 52.5/428 of the width to the right
 *   9  wings, body and feet appear below the head                                           (Logo-splash-9)
 *  10  the branch grows in under Brijo from the left; grass rises along the bottom (Logo-splash-10-11-&-14, grass-splash-10)
 *  11  clouds, jungle canopy and taller plants fade in                                     (bg-splash-11)
 *  12  vines drop in from the canopy; Brijo tilts her head 20° one way                      (bg-splash-12-13-&-14, Logo-splash-12)
 *  13  …then 20° the other way                                                              (Logo-splash-13)
 *  14  head straight again; Brijo winks, stars burst from her head and the wordmark bounces back in letter by
 *      letter — then `onDone` hands over to /welcome                                      (Logo-splash-10-11-&-14)
 *
 * Throughout: squash-and-stretch on each landing, a gentle idle "breath", and a sound + haptic on each beat.
 *
 * Frames 1–3 use the small logo owl; at 3 → 4 it is swapped for the big owl posed to match it exactly, which then
 * grows into frame 4. Calls `onDone` after frame 14; a tap skips straight there. Under reduced motion it fades 1 → 4 → 9 → 10 → 11 → 12 (in its final
 * spot) with no movement or head tilts.
 */

import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";

import { AnimatedPressable } from "./components/AnimatedSvg";
import BigOwl from "./components/BigOwl";
import BranchLayer from "./components/BranchLayer";
import FinaleWordmark from "./components/FinaleWordmark";
import GrassLayer from "./components/GrassLayer";
import Owl from "./components/Owl";
import SceneBackdrop from "./components/SceneBackdrop";
import SparkleBurst from "./components/SparkleBurst";
import Wordmark from "./components/Wordmark";
import { BIG, FRAME7_HEAD_Y } from "./constants";
import { useSplashStyles } from "./hooks/useSplashStyles";
import { useSplashTimeline } from "./hooks/useSplashTimeline";
import { useSplashValues } from "./hooks/useSplashValues";
import { splashLayout } from "./layout";

export default function SplashIntro({ onDone }: Readonly<{ onDone: () => void }>) {
  const reduce = useReducedMotion();
  const { width: W, height: H } = useWindowDimensions();

  const {
    logoW,
    logoH,
    centreShift,
    unit,
    bigStartScale,
    bigStartY,
    frame7Y,
    frame8X,
    branchTop,
    grassH,
    finaleW,
  } = splashLayout(W, H);

  const values = useSplashValues(reduce, bigStartScale, bigStartY);
  const { pupils, bodyOpacity, headTilt, wink, burst } = values;

  const skip = useSplashTimeline({
    values,
    reduce,
    centreShift,
    frame7Y,
    frame8X,
    onDone,
  });

  const {
    wordStyle,
    owlStyle,
    bigStyle,
    skyStyle,
    baseStyle,
    branchStyle,
    bg10Style,
    bg11Style,
    bg12Style,
    grassStyle,
  } = useSplashStyles(values, W, grassH);

  return (
    <AnimatedPressable
      style={[StyleSheet.absoluteFill, baseStyle]}
      onPress={skip}
      accessibilityRole="button"
      accessibilityLabel="ArithmeTick"
      accessibilityHint="Skips the intro"
    >
      <SceneBackdrop
        skyStyle={skyStyle}
        bg10Style={bg10Style}
        bg11Style={bg11Style}
        bg12Style={bg12Style}
      />
      <View style={styles.centre}>
        <View style={{ width: logoW, height: logoH }}>
          <Animated.View style={[{ transformOrigin: "50% 60%" }, owlStyle]}>
            <Owl width={logoW} pupilsOpacity={pupils} />
          </Animated.View>
          <Animated.View style={wordStyle}>
            <Wordmark width={logoW} />
          </Animated.View>
        </View>
      </View>
      <BranchLayer W={W} top={branchTop} unit={unit} branchStyle={branchStyle} />
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: W / 2 - BIG.cx * unit,
            top: H / 2 - BIG.headMid * unit,
            transformOrigin: `${(BIG.cx / BIG.w) * 100}% ${(BIG.bodyCy / BIG.h) * 100}%`,
          },
          bigStyle,
        ]}
      >
        <BigOwl
          unit={unit}
          bodyOpacity={bodyOpacity}
          pupilsOpacity={pupils}
          headTilt={headTilt}
          winkOpacity={wink}
        />
      </Animated.View>
      {reduce ? null : (
        <SparkleBurst
          left={W / 2 + frame8X}
          top={FRAME7_HEAD_Y * H}
          progress={burst}
          unit={unit}
        />
      )}
      <FinaleWordmark W={W} H={H} finaleW={finaleW} reduce={reduce} />
      <GrassLayer W={W} grassH={grassH} grassStyle={grassStyle} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: "center", justifyContent: "center" },
});
