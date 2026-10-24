/**
 * Jaymo lens rims, rings and eye base (static, both lenses).
 */

import { Circle, G, Path } from "react-native-svg";

import { EYE_X, type EyeKind } from "./eyeConfig";
import { C, EYE, FACE_Y, LENS, W } from "./geometry";

export function LensBase({ kind, ink }: Readonly<{ kind: EyeKind; ink: number }>) {
  const y = FACE_Y;
  return (
    <G>
      {[LENS.left, LENS.right].map((cx, i) => (
        <G key={cx}>
          <Circle cx={cx} cy={y} r={LENS.r} fill={C.rim} stroke={C.outline} strokeWidth={W.lens * ink} />
          <Circle cx={EYE_X[i]} cy={y} r={EYE.ringR} fill={C.grey} />
          <Circle cx={EYE_X[i]} cy={y} r={EYE.r} fill={kind === "open" ? C.white : C.lid} />
          {kind !== "open" && (
            <Path
              d={
                kind === "happy"
                  ? `M${EYE_X[i] - 9} ${y + 4.5} Q${EYE_X[i]} ${y - 8.5} ${EYE_X[i] + 9} ${y + 4.5}`
                  : `M${EYE_X[i] - 9.5} ${y - 1.5} Q${EYE_X[i]} ${y + 8} ${EYE_X[i] + 9.5} ${y - 1.5}`
              }
              fill="none"
              stroke={C.outline}
              strokeWidth={3.4 * Math.min(ink, 1.2)}
              strokeLinecap="round"
            />
          )}
        </G>
      ))}
    </G>
  );
}
