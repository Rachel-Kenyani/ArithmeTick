/**
 * Brijo's squashable body SVG: body, flapping wings and kitenge chest, with the head as children.
 */

import type { ReactNode } from "react";
import Svg, { G, Path } from "react-native-svg";

import { AnimatedG, useMatrixProps } from "./AnimatedG";
import { BODY_PATH, C, CHEST, KITENGE_PATH, PIVOT, W } from "./geometry";
import { Wing } from "./Limbs";
import { matrix, val, type Rig } from "./sampling";

export function Body({ rig, ink, children }: Readonly<{ rig: Rig; ink: number; children: ReactNode }>) {
  const wingLProps = useMatrixProps(() => {
    "worklet";
    return matrix(PIVOT.wingL[0], PIVOT.wingL[1], val(rig, "wingL", "rotate"), 0, 0, 1, 1);
  });
  const wingRProps = useMatrixProps(() => {
    "worklet";
    return matrix(PIVOT.wingR[0], PIVOT.wingR[1], val(rig, "wingR", "rotate"), 0, 0, 1, 1);
  });

  return (
    <Svg width="100%" height="100%" viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      <Path d={BODY_PATH} fill={C.body} stroke={C.outline} strokeWidth={W.line * ink} strokeLinejoin="round" />
      <AnimatedG animatedProps={wingLProps}>
        <Wing ink={ink} />
      </AnimatedG>
      <AnimatedG animatedProps={wingRProps}>
        <Wing ink={ink} mirror />
      </AnimatedG>
      <G stroke={C.outline} strokeLinejoin="round">
        <Path d={CHEST} fill={C.teal} strokeWidth={W.line * ink} />
        <Path d={KITENGE_PATH} fill={C.kitenge} strokeWidth={W.kitenge * ink} />
      </G>

      {children}
    </Svg>
  );
}
