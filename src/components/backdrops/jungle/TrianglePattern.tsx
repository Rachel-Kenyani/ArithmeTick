/**
 * Kitenge triangle lattice layer for JungleBackdrop.
 */

import { StyleSheet } from "react-native";
import Svg, { Defs, G, LinearGradient as SvgLinearGradient, Mask, Path, Pattern, Rect, Stop } from "react-native-svg";

/* ------------------------------------------------------------------------------------------------
 * Kitenge triangle pattern — a 36×64 tile, masked by a vertical opacity gradient
 * ---------------------------------------------------------------------------------------------- */

export function TrianglePattern({ uid, width, height }: Readonly<{ uid: string; width: number; height: number }>) {
  // web: background-position 50% 0 → centre a tile horizontally
  const offsetX = ((((width - 36) / 2) % 36) + 36) % 36;
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern id={`${uid}p`} patternUnits="userSpaceOnUse" x={offsetX} y={0} width={36} height={64} viewBox="0 0 36 64">
          <G fill="none" stroke="#fff" strokeLinejoin="round">
            <Path d="M0 0H36M0 32H36M0 64H36" strokeWidth={1.6} strokeOpacity={0.36} />
            <Path d="M-18 0 18 64M18 0 54 64M-18 64 18 0M18 64 54 0" strokeWidth={1.9} strokeOpacity={0.42} />
            <Path d="M18 9.5 28 27.5H8ZM0 41.5 10 59.5H-10ZM36 41.5 46 59.5H26Z" strokeWidth={1.3} strokeOpacity={0.26} />
          </G>
        </Pattern>
        <SvgLinearGradient id={`${uid}g`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#fff" stopOpacity={0.1} />
          <Stop offset="0.35" stopColor="#fff" stopOpacity={0.24} />
          <Stop offset="0.7" stopColor="#fff" stopOpacity={0.66} />
          <Stop offset="1" stopColor="#fff" stopOpacity={1} />
        </SvgLinearGradient>
        <Mask id={`${uid}m`} maskUnits="userSpaceOnUse" x={0} y={0} width={width} height={height}>
          <Rect x={0} y={0} width={width} height={height} fill={`url(#${uid}g)`} />
        </Mask>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${uid}p)`} mask={`url(#${uid}m)`} />
    </Svg>
  );
}
