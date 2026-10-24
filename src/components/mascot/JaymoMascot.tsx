/**
 * Jaymo the Owl — ArithmeTick's mascot (React Native port of components/JaymoMascot.tsx).
 *
 * Same artwork as the web: a 200×200 viewBox drawn with react-native-svg, scaled to `size`.
 *
 * Animation model (react-native-reanimated v4, everything on the UI thread)
 * -------------------------------------------------------------------------
 * - One frame-callback clock (`clock`, seconds) drives every mood loop. Each part's value is
 *   sampled from the mood's keyframe script by a worklet, so the React tree never re-renders to
 *   animate.
 * - Mood changes cross-fade from the previous mood's sampled pose into the new one with a spring
 *   (`blend` 0→1), so switching moods never snaps; plus a small springy "pop".
 * - Whole-body layers (boop/pop, shadow, rig sway/hop, squash) are RN `Animated.View` transforms.
 *   Only parts that must move independently inside an SVG are animated SVG groups (via the
 *   native `matrix` prop): wings ×2, head, beak, mouth, gaze, upper + lower lids (both eyes
 *   share one node each), feet ×2.
 * - Blink and idle gaze are fired from effect-owned timers. Tapping Jaymo plays a "boop".
 * - Reduced motion (`useReducedMotion`): the clock never starts and every part shows its rest pose.
 */
import { memo, useCallback, useId } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, useReducedMotion, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import Svg, { Ellipse } from "react-native-svg";

import { sfx } from "@/services/audio";

import { Body } from "./jaymo/Body";
import { MOODS } from "./jaymo/choreography";
import { EYES } from "./jaymo/eyeConfig";
import { Feet } from "./jaymo/Feet";
import { C, inkFor, PIVOT } from "./jaymo/geometry";
import { Head } from "./jaymo/Head";
import type { Rig } from "./jaymo/sampling";
import { SCRIPTS } from "./jaymo/scripts";
import { SleepZ, Z_PARTS } from "./jaymo/SleepZ";
import type { JaymoMascotProps } from "./jaymo/types";
import { useBlink } from "./jaymo/useBlink";
import { useGaze } from "./jaymo/useGaze";
import { useJaymoClock } from "./jaymo/useJaymoClock";
import { useLayerStyles } from "./jaymo/useLayerStyles";
import { useMoodBlend } from "./jaymo/useMoodBlend";

export type { JaymoMascotProps, JaymoMood } from "./jaymo/types";

/* ------------------------------------------------------------------------------------------
 * Component
 * ---------------------------------------------------------------------------------------- */

function JaymoMascot({ mood = "idle", size = 96, style }: Readonly<JaymoMascotProps>) {
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const moodIdx = Math.max(0, MOODS.indexOf(mood));
  const eyes = EYES[mood];
  const ink = inkFor(size);
  const k = size / 200;

  // One clock for every loop; never started under reduced motion.
  const clock = useJaymoClock(reduceMotion);
  const popX = useSharedValue(1);
  const popY = useSharedValue(1);
  // Mood change: cross-fade from the old mood's pose, plus a springy pop.
  const { moodSV, prevSV, blend } = useMoodBlend(moodIdx, reduceMotion, popX, popY);
  const rig: Rig = { clock, mood: moodSV, prev: prevSV, blend, still: reduceMotion };

  const canBlink = eyes === "open" && !reduceMotion;
  const { lid, blinkOnce } = useBlink(canBlink);

  // Idle curiosity: pupils glance around now and then; other moods look straight ahead.
  const canGaze = mood === "idle" && !reduceMotion;
  const { gazeX, gazeY } = useGaze(eyes, canGaze, reduceMotion);

  // Tap Jaymo: squishy boop + blink + soft "boop" note. Purely decorative.
  const handleBoop = useCallback(() => {
    sfx.pickup();
    if (reduceMotion) return;
    const o = { duration: 100, easing: Easing.out(Easing.quad) };
    popX.set(withSequence(withTiming(1.14, o), withTiming(0.94, o), withTiming(1.03, o), withTiming(1, o)));
    popY.set(withSequence(withTiming(0.86, o), withTiming(1.08, o), withTiming(0.98, o), withTiming(1, o)));
    if (eyes === "open") blinkOnce(false);
  }, [reduceMotion, popX, popY, eyes, blinkOnce]);

  /* ---- View layers ---- */
  const origin = (p: readonly [number, number]) => [p[0] * k, p[1] * k, 0] as [number, number, number];

  const { boopStyle, shadowStyle, rigStyle, squashStyle } = useLayerStyles(rig, popX, popY, k);

  // Tufts: static per-mood tilt (no loop), so a plain transform string is enough.
  const tuftL = SCRIPTS[mood].tuftL?.rest?.rotate ?? 0;
  const tuftR = SCRIPTS[mood].tuftR?.rest?.rotate ?? 0;

  const layer = StyleSheet.absoluteFill;

  return (
    <Pressable
      onPressIn={handleBoop}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Jaymo the Owl"
      style={[{ width: size, height: size, flexShrink: 0 }, style]}
    >
      <Animated.View
        style={[layer, { transformOrigin: origin(PIVOT.boop) }, boopStyle]}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        pointerEvents="none"
      >
        <Animated.View style={[layer, { transformOrigin: origin(PIVOT.shadow) }, shadowStyle]}>
          <Svg width="100%" height="100%" viewBox="0 0 200 200">
            <Ellipse cx={100} cy={196.8} rx={40} ry={3.4} fill={C.outline} fillOpacity={0.16} />
          </Svg>
        </Animated.View>

        <Animated.View style={[layer, { transformOrigin: origin(PIVOT.rig) }, rigStyle]}>
          <Animated.View style={[layer, { transformOrigin: origin(PIVOT.squash) }, squashStyle]}>
            <Body rig={rig} ink={ink}>
              <Head
                rig={rig}
                ink={ink}
                eyes={eyes}
                tuftL={tuftL}
                tuftR={tuftR}
                clipId={`${uid}-eyes`}
                lid={lid}
                gazeX={gazeX}
                gazeY={gazeY}
              />
            </Body>
          </Animated.View>

          {/* toes stay planted (outside the squash) and sit in front of the chest's tip */}
          <View style={layer}>
            <Feet rig={rig} ink={ink} />
          </View>
        </Animated.View>

        {mood === "sleep" && Z_PARTS.map((p) => <SleepZ key={p} part={p} rig={rig} k={k} ink={ink} />)}
      </Animated.View>
    </Pressable>
  );
}

export default memo(JaymoMascot);
