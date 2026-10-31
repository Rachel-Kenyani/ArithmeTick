/**
 * The 14-frame splash animation (see timeline/ for the steps). Frames 1–3 use the small logo owl; at 3 → 4 it is
 * swapped for the big owl posed to match it exactly. Calls `onDone` after frame 14; a tap skips straight there.
 * Under reduced motion it fades 1 → 4 → 9 → 10 → 11 → 12 with no movement or head tilts.
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
