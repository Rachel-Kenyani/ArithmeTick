/**
 * A palm crown in a padded viewBox (optionally mirrored for the top-right corner).
 */

import Svg, { G, Path } from "react-native-svg";

import { C } from "./palette";
import { PALM_H, PALM_PAD, PALM_W, type PalmArt } from "./palmArt";

export function Palm({ art, mirrored, width }: Readonly<{ art: PalmArt; mirrored?: boolean; width: number }>) {
  const s = width / PALM_W;
  const vw = PALM_W + PALM_PAD.l + PALM_PAD.r;
  const vh = PALM_H + PALM_PAD.t + PALM_PAD.b;
  return (
    <Svg
      width={vw * s}
      height={vh * s}
      viewBox={`${-PALM_PAD.l} ${-PALM_PAD.t} ${vw} ${vh}`}
      style={{ position: "absolute", left: -PALM_PAD.l * s, top: -PALM_PAD.t * s }}
    >
      <G transform={mirrored ? `translate(${PALM_W} 0) scale(-1 1)` : undefined}>
        <Path d={art.vineStems} fill="none" stroke={C.vine} strokeWidth={3} strokeLinecap="round" />
        <Path d={art.vineLeaves} fill={C.vineLeaf} />
        <Path d={art.fronds[0]} fill={C.frond[0]} />
        <Path d={art.fronds[1]} fill={C.frond[1]} />
        <Path d={art.fronds[2]} fill={C.frond[2]} />
        <Path d={art.ribs} fill="none" stroke={C.rib} strokeWidth={2} strokeLinecap="round" />
        <Path d={art.trunk} fill="none" stroke={C.trunk} strokeWidth={5} strokeLinecap="round" />
        <Path d={art.fanMid} fill={C.fanMid} />
        <Path d={art.fanDark} fill={C.fanDark} />
      </G>
    </Svg>
  );
}
