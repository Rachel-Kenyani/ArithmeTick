/**
 * Static Brijo limb artwork — wing and three-toed foot.
 */

import { G, Path, Rect } from "react-native-svg";

import { C, TOE, W, WING_L } from "./geometry";

/* ------------------------------------------------------------------------------------------
 * Static artwork pieces
 * ---------------------------------------------------------------------------------------- */

export function Wing({ ink, mirror }: Readonly<{ ink: number; mirror?: boolean }>) {
  return (
    <Path
      d={WING_L}
      transform={mirror ? "matrix(-1 0 0 1 200 0)" : undefined}
      fill={C.wing}
      stroke={C.outline}
      strokeWidth={W.line * ink}
      strokeLinejoin="round"
    />
  );
}

export function Foot({ cx, ink }: Readonly<{ cx: number; ink: number }>) {
  return (
    <G fill={C.orange} stroke={C.outline} strokeWidth={W.toe * ink}>
      {[-TOE.gap, 0, TOE.gap].map((dx) => (
        <Rect key={dx} x={cx + dx - TOE.w / 2} y={TOE.y} width={TOE.w} height={TOE.h} rx={TOE.w / 2} />
      ))}
    </G>
  );
}
