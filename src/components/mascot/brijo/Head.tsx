/**
 * Brijo's head: temple arms, face, tufts, lenses + eyes, mouth and beak (rotates about the neck).
 */

import type { SharedValue } from "react-native-reanimated";
import { Ellipse, G, Path } from "react-native-svg";

import { AnimatedG, useMatrixProps } from "./AnimatedG";
import type { EyeKind } from "./eyeConfig";
import {
  BEAK_LOWER_FILL,
  BEAK_LOWER_LINE,
  BEAK_UPPER_FILL,
  BEAK_UPPER_LINE,
  BRIDGE,
  C,
  FOREHEAD_V,
  HEAD,
  MOUTH_PATH,
  PIVOT,
  TEMPLE_ARMS,
  TUFT_L,
  TUFT_R,
  W,
} from "./geometry";
import { LensBase } from "./LensBase";
import { OpenEyes } from "./OpenEyes";
import { matrix, val, type Rig } from "./sampling";

interface HeadProps {
  rig: Rig;
  ink: number;
  eyes: EyeKind;
  tuftL: number;
  tuftR: number;
  clipId: string;
  lid: SharedValue<number>;
  gazeX: SharedValue<number>;
  gazeY: SharedValue<number>;
}

export function Head({ rig, ink, eyes, tuftL, tuftR, clipId, lid, gazeX, gazeY }: Readonly<HeadProps>) {
  const headProps = useMatrixProps(() => {
    "worklet";
    return matrix(PIVOT.head[0], PIVOT.head[1], val(rig, "head", "rotate"), 0, 0, 1, 1);
  });
  const mouthProps = useMatrixProps(() => {
    "worklet";
    return matrix(PIVOT.mouth[0], PIVOT.mouth[1], 0, 0, 0, 1, Math.max(0.001, val(rig, "mouth", "scaleY")));
  });
  const beakProps = useMatrixProps(() => {
    "worklet";
    return [1, 0, 0, 1, 0, val(rig, "beak", "y")];
  });

  return (
    <AnimatedG animatedProps={headProps}>
      <Path d={TEMPLE_ARMS} stroke={C.outline} strokeWidth={W.arm * ink} strokeLinecap="round" />
      <Ellipse
        cx={HEAD.cx}
        cy={HEAD.cy}
        rx={HEAD.rx}
        ry={HEAD.ry}
        fill={C.teal}
        stroke={C.outline}
        strokeWidth={W.line * ink}
      />
      <G fill={C.tuft} stroke={C.outline} strokeWidth={W.line * ink} strokeLinejoin="round">
        <Path d={FOREHEAD_V} />
        <Path d={TUFT_L} transform={`rotate(${tuftL} 64 33.5)`} />
        <Path d={TUFT_R} transform={`rotate(${tuftR} 136 33.5)`} />
      </G>

      <Path d={BRIDGE} stroke={C.outline} strokeWidth={W.bridge * ink} />
      <LensBase kind={eyes} ink={ink} />
      {eyes === "open" && (
        <OpenEyes ink={ink} clipId={clipId} lid={lid} gazeX={gazeX} gazeY={gazeY} />
      )}

      <AnimatedG animatedProps={mouthProps}>
        <Path d={MOUTH_PATH} fill={C.mouth} />
        <Ellipse cx={100} cy={88.6} rx={3.6} ry={1.8} fill={C.tongue} />
      </AnimatedG>
      <AnimatedG animatedProps={beakProps}>
        <Path d={BEAK_LOWER_FILL} fill={C.orange} />
        <Path
          d={BEAK_LOWER_LINE}
          fill="none"
          stroke={C.outline}
          strokeWidth={W.beak * ink}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </AnimatedG>
      <Path d={BEAK_UPPER_FILL} fill={C.orange} />
      <Path
        d={BEAK_UPPER_LINE}
        fill="none"
        stroke={C.outline}
        strokeWidth={W.beak * ink}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </AnimatedG>
  );
}
