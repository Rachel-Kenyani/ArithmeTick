/**
 * Brijo open eyes — gaze-tracking irises and blinking lids.
 */

import type { SharedValue } from "react-native-reanimated";
import { Circle, ClipPath, Defs, G, Path, Rect } from "react-native-svg";

import { AnimatedG, useMatrixProps } from "./AnimatedG";
import { EYE_X, IRIS_X, LID_DROP, LID_RISE } from "./eyeConfig";
import { C, EYE, FACE_Y, W } from "./geometry";

interface OpenEyesProps {
  ink: number;
  clipId: string;
  lid: SharedValue<number>;
  gazeX: SharedValue<number>;
  gazeY: SharedValue<number>;
}

/** Irises + eyelids for both eyes: three animated nodes total, clipped to the two eye discs. */
export function OpenEyes({ ink, clipId, lid, gazeX, gazeY }: Readonly<OpenEyesProps>) {
  const y = FACE_Y;
  const gazeProps = useMatrixProps(() => {
    "worklet";
    return [1, 0, 0, 1, gazeX.value, gazeY.value];
  });
  const upperProps = useMatrixProps(() => {
    "worklet";
    return [1, 0, 0, 1, 0, lid.value * LID_DROP];
  });
  const lowerProps = useMatrixProps(() => {
    "worklet";
    return [1, 0, 0, 1, 0, -lid.value * LID_RISE];
  });
  return (
    <>
      <Defs>
        <ClipPath id={clipId}>
          <Circle cx={EYE_X[0]} cy={y} r={EYE.r} />
          <Circle cx={EYE_X[1]} cy={y} r={EYE.r} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${clipId})`}>
        <AnimatedG animatedProps={gazeProps}>
          {IRIS_X.map((ix) => (
            <G key={ix}>
              <Circle cx={ix} cy={y} r={EYE.irisR} fill={C.grey} />
              <Circle cx={ix} cy={y} r={EYE.pupilR} fill={C.pupil} />
              <Circle cx={ix + 3.3} cy={y - 3.4} r={2.5} fill={C.white} />
              <Circle cx={ix - 2.9} cy={y + 3.1} r={1.05} fill={C.white} />
            </G>
          ))}
        </AnimatedG>
        <AnimatedG animatedProps={lowerProps}>
          {EYE_X.map((ex) => (
            <Rect key={ex} x={ex - 19} y={y + EYE.r} width={38} height={38} fill={C.lid} />
          ))}
        </AnimatedG>
        <AnimatedG animatedProps={upperProps}>
          {EYE_X.map((ex) => (
            <G key={ex}>
              <Rect x={ex - 19} y={y - EYE.r - 38} width={38} height={38} fill={C.lid} />
              <Path d={`M${ex - 19} ${y - EYE.r} H${ex + 19}`} stroke={C.outline} strokeWidth={W.lash * ink} />
            </G>
          ))}
        </AnimatedG>
      </G>
    </>
  );
}
