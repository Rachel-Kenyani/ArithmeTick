/**
 * A single cartoon cloud (halo, outline, shaded body, hatching).
 */

import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

import { cloudHatches, cloudPath, type CloudDef } from "./cloudArt";
import { C } from "./palette";

export function Cloud({ def, clipId, width }: Readonly<{ def: CloudDef; clipId: string; width: number }>) {
  const d = cloudPath(def);
  const vw = def.w + 16;
  const vh = def.h + 16;
  return (
    <Svg width={width} height={(width * vh) / vw} viewBox={`-8 -8 ${vw} ${vh}`}>
      <Defs>
        <ClipPath id={clipId}>
          <Path d={d} />
        </ClipPath>
      </Defs>
      <Path d={d} fill={C.cloudHalo} stroke={C.cloudHalo} strokeWidth={13} opacity={0.6} />
      <Path d={d} fill={C.cloudEdge} stroke={C.cloudEdge} strokeWidth={5.5} />
      <G clipPath={`url(#${clipId})`}>
        <Rect x={-8} y={-8} width={vw} height={vh} fill={C.cloudUnder} />
        <Path d={d} fill={C.cloudTop} transform={[{ translateY: -10 }]} />
        <Path d={cloudHatches(def)} fill="none" stroke={C.cloudHatch} strokeWidth={1.3} strokeLinecap="round" />
      </G>
    </Svg>
  );
}
