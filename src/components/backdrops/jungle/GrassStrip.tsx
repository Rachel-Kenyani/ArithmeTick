/**
 * Bottom grass + rocks strip for JungleBackdrop.
 */

import Svg, { G, Path } from "react-native-svg";

import { GRASS, GRASS_H, GRASS_W } from "./grassArt";
import { C, GRASS_TONES } from "./palette";

export function GrassStrip({ width, height }: Readonly<{ width: number; height: number }>) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${GRASS_W} ${GRASS_H}`}
      preserveAspectRatio="xMidYMax slice"
      style={{ position: "absolute", left: 0, bottom: 0 }}
    >
      {/* dense low turf as one silhouette: a wide outline stroke under a plain fill */}
      <Path d={GRASS.turf} fill={C.bladeEdge} stroke={C.bladeEdge} strokeWidth={2.6} strokeLinejoin="round" />
      <Path d={GRASS.turf} fill={GRASS_TONES[0][0]} />
      <G stroke={C.bladeEdge} strokeWidth={1.3} strokeLinejoin="round">
        {[...GRASS.back, ...GRASS.front].flatMap((b) => [
          <Path key={`b${b.body}`} d={b.body} fill={GRASS_TONES[b.layer][0]} />,
          <Path key={`l${b.body}`} d={b.lit} fill={GRASS_TONES[b.layer][1]} />,
        ])}
      </G>
      <G stroke={C.rockEdge} strokeWidth={1.6} strokeLinejoin="round">
        {GRASS.rocks.flatMap((r) => [
          <Path key={`r${r.base}`} d={r.base} fill={C.rock} />,
          <Path key={`h${r.base}`} d={r.light} fill={C.rockLight} stroke="none" />,
          <Path key={`s${r.base}`} d={r.dark} fill={C.rockDark} stroke="none" />,
        ])}
      </G>
    </Svg>
  );
}
