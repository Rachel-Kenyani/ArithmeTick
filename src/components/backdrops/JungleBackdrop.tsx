/**
 * JungleBackdrop (React Native port of arithmetick/components/ui/JungleBackdrop.tsx).
 *
 * Layers, back to front (all decorative: pointerEvents none, hidden from accessibility):
 *   1. sky gradient (expo-linear-gradient, jg-* tokens)
 *   2. kitenge triangle lattice (SVG <Pattern>, masked so it grows stronger towards the bottom)
 *   3. cartoon clouds drifting slowly
 *   4. canopy (prop): hanging vine strip + palm fronds in both top corners
 *   5. grass (prop): two-tone grass blades + rocks along the bottom
 * Children render in a flex:1 View on top. Safe-area insets are NOT handled here (ScreenShell does that).
 *
 * The artwork geometry is computed ONCE at module load with a seeded PRNG. Motion animates transforms of
 * wrapping Animated.Views only (no per-path animatedProps), and is off under reduced motion.
 */
import { useId, type ReactNode } from "react";
import { StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useReducedMotion } from "react-native-reanimated";

import { colors } from "@/theme";

import { Cloud } from "./jungle/Cloud";
import { CLOUD_BIG, CLOUD_SMALL, CLOUD_WIDE } from "./jungle/cloudArt";
import { GrassStrip } from "./jungle/GrassStrip";
import { Motion } from "./jungle/Motion";
import { C, clamp, SKY, SKY_STOPS } from "./jungle/palette";
import { Palm } from "./jungle/Palm";
import { PALM_H, PALM_LEFT, PALM_RIGHT, PALM_W } from "./jungle/palmArt";
import { TrianglePattern } from "./jungle/TrianglePattern";
import { VINE_H, VINE_W, VINES } from "./jungle/vines";

export interface JungleBackdropProps {
  children?: ReactNode;
  /** Bottom grass + rocks strip (default true). Always behind content, not touchable. */
  grass?: boolean;
  /** Hanging vines + palm fronds along the top (default true). */
  canopy?: boolean;
  /** Extra style for the content column wrapper (flex: 1 by default). Replaces the web `className`. */
  style?: StyleProp<ViewStyle>;
}
/* ------------------------------------------------------------------------------------------------
 * Component
 * ---------------------------------------------------------------------------------------------- */

export default function JungleBackdrop({ children, grass = true, canopy = true, style }: Readonly<JungleBackdropProps>) {
  const uid = `jg${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { width: W, height: H } = useWindowDimensions();
  const motion = !useReducedMotion();

  const cloudBigW = clamp(160, W * 0.4, 300);
  const cloudWideW = clamp(160, W * 0.38, 300);
  const cloudSmallW = clamp(120, W * 0.14, 200);
  const vineH = clamp(84, H * 0.14, 132);
  const palmW = clamp(132, W * 0.3, 260);
  const palmH = (palmW * PALM_H) / PALM_W;
  const grassH = clamp(76, H * 0.15, 148);

  return (
    <View style={styles.root}>
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <LinearGradient colors={SKY} locations={SKY_STOPS} style={StyleSheet.absoluteFill} />
        <TrianglePattern uid={uid} width={W} height={H} />

        <Motion kind="drift" duration={42000} enabled={motion} style={{ position: "absolute", left: W * 0.13, top: clamp(26, H * 0.05, 60) }}>
          <Cloud def={CLOUD_BIG} clipId={`${uid}c1`} width={cloudBigW} />
        </Motion>
        {W >= 1024 ? (
          <Motion
            kind="drift"
            duration={56000}
            phase={0.36}
            enabled={motion}
            style={{ position: "absolute", right: W * 0.1, top: clamp(240, H * 0.44, 440) }}
          >
            <Cloud def={CLOUD_SMALL} clipId={`${uid}c2`} width={cloudSmallW} />
          </Motion>
        ) : null}
        <Motion
          kind="drift"
          duration={48000}
          phase={0.65}
          enabled={motion}
          style={{ position: "absolute", right: Math.max(-14, W * 0.12 - 60), top: clamp(108, H * 0.15, 170) }}
        >
          <Cloud def={CLOUD_WIDE} clipId={`${uid}c3`} width={cloudWideW} />
        </Motion>

        {canopy ? (
          <>
            {VINES.map((layer, i) => (
              <Motion
                key={layer.stems}
                kind="swing"
                duration={5200 + i * 1300}
                phase={((i * 2.1) / (5.2 + i * 1.3)) % 1}
                enabled={motion}
                style={{ position: "absolute", left: 0, top: 0, width: W, height: vineH, transformOrigin: "50% 0%" }}
              >
                <Svg width={W} height={vineH} viewBox={`0 0 ${VINE_W} ${VINE_H}`} preserveAspectRatio="xMidYMin slice">
                  <Path d={layer.stems} fill="none" stroke={C.vine} strokeWidth={3} strokeLinecap="round" />
                  <Path d={layer.leaves} fill={C.vineLeaf} />
                </Svg>
              </Motion>
            ))}
            <Motion
              kind="sway"
              duration={7000}
              enabled={motion}
              style={{ position: "absolute", top: -4, left: clamp(-60, 14 - W * 0.06, -4), width: palmW, height: palmH, transformOrigin: "44% 6%" }}
            >
              <Palm art={PALM_LEFT} width={palmW} />
            </Motion>
            <Motion
              kind="sway"
              duration={8500}
              reverse
              enabled={motion}
              style={{ position: "absolute", top: -4, right: clamp(-48, 18 - W * 0.06, -2), width: palmW, height: palmH, transformOrigin: "66% 5%" }}
            >
              <Palm art={PALM_RIGHT} mirrored width={palmW} />
            </Motion>
          </>
        ) : null}

        {grass ? <GrassStrip width={W} height={grassH} /> : null}
      </View>

      <View style={[styles.content, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden", backgroundColor: colors.jgSky },
  content: { flex: 1 },
});
