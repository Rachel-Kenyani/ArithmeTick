import { memo, useCallback, useId } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, useReducedMotion, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import Svg, { Ellipse } from "react-native-svg";

import { sfx } from "@/services/audio";

import { Body } from "./brijo/Body";
import { MOODS } from "./brijo/choreography";
import { EYES } from "./brijo/eyeConfig";
import { Feet } from "./brijo/Feet";
import { C, inkFor, PIVOT } from "./brijo/geometry";
import { Head } from "./brijo/Head";
import type { Rig } from "./brijo/sampling";
import { SCRIPTS } from "./brijo/scripts";
import { SleepZ, Z_PARTS } from "./brijo/SleepZ";
import type { BrijoMascotProps } from "./brijo/types";
import { useBlink } from "./brijo/useBlink";
import { useGaze } from "./brijo/useGaze";
import { useBrijoClock } from "./brijo/useBrijoClock";
import { useLayerStyles } from "./brijo/useLayerStyles";
import { useMoodBlend } from "./brijo/useMoodBlend";

export type { BrijoMascotProps, BrijoMood } from "./brijo/types";

function BrijoMascot({ mood = "idle", size = 96, style }: Readonly<BrijoMascotProps>) {
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const moodIdx = Math.max(0, MOODS.indexOf(mood));
  const eyes = EYES[mood];
  const ink = inkFor(size);
  const k = size / 200;

  const clock = useBrijoClock(reduceMotion);
  const popX = useSharedValue(1);
  const popY = useSharedValue(1);
  const { moodSV, prevSV, blend } = useMoodBlend(moodIdx, reduceMotion, popX, popY);
  const rig: Rig = { clock, mood: moodSV, prev: prevSV, blend, still: reduceMotion };

  const canBlink = eyes === "open" && !reduceMotion;
  const { lid, blinkOnce } = useBlink(canBlink);

  const canGaze = mood === "idle" && !reduceMotion;
  const { gazeX, gazeY } = useGaze(eyes, canGaze, reduceMotion);

  const handleBoop = useCallback(() => {
    sfx.pickup();
    if (reduceMotion) return;
    const o = { duration: 100, easing: Easing.out(Easing.quad) };
    popX.set(withSequence(withTiming(1.14, o), withTiming(0.94, o), withTiming(1.03, o), withTiming(1, o)));
    popY.set(withSequence(withTiming(0.86, o), withTiming(1.08, o), withTiming(0.98, o), withTiming(1, o)));
    if (eyes === "open") blinkOnce(false);
  }, [reduceMotion, popX, popY, eyes, blinkOnce]);

  const origin = (p: readonly [number, number]) => [p[0] * k, p[1] * k, 0] as [number, number, number];

  const { boopStyle, shadowStyle, rigStyle, squashStyle } = useLayerStyles(rig, popX, popY, k);

  const tuftL = SCRIPTS[mood].tuftL?.rest?.rotate ?? 0;
  const tuftR = SCRIPTS[mood].tuftR?.rest?.rotate ?? 0;

  const layer = StyleSheet.absoluteFill;

  return (
    <Pressable
      onPressIn={handleBoop}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Brijo the Owl"
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

          <View style={layer}>
            <Feet rig={rig} ink={ink} />
          </View>
        </Animated.View>

        {mood === "sleep" && Z_PARTS.map((p) => <SleepZ key={p} part={p} rig={rig} k={k} ink={ink} />)}
      </Animated.View>
    </Pressable>
  );
}

export default memo(BrijoMascot);
