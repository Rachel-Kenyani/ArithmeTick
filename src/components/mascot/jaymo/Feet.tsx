/**
 * Jaymo's planted feet (outside the squash), each tapping/rotating about its own pivot.
 */

import Svg from "react-native-svg";

import { AnimatedG, useMatrixProps } from "./AnimatedG";
import { FOOT_X, PIVOT } from "./geometry";
import { Foot } from "./Limbs";
import { matrix, val, type Rig } from "./sampling";

export function Feet({ rig, ink }: Readonly<{ rig: Rig; ink: number }>) {
  const footLProps = useMatrixProps(() => {
    "worklet";
    return matrix(PIVOT.footL[0], PIVOT.footL[1], val(rig, "footL", "rotate"), 0, val(rig, "footL", "y"), 1, 1);
  });
  const footRProps = useMatrixProps(() => {
    "worklet";
    return matrix(PIVOT.footR[0], PIVOT.footR[1], val(rig, "footR", "rotate"), 0, val(rig, "footR", "y"), 1, 1);
  });

  return (
    <Svg width="100%" height="100%" viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      <AnimatedG animatedProps={footLProps}>
        <Foot cx={FOOT_X.left} ink={ink} />
      </AnimatedG>
      <AnimatedG animatedProps={footRProps}>
        <Foot cx={FOOT_X.right} ink={ink} />
      </AnimatedG>
    </Svg>
  );
}
