/**
 * Static wood-grain artwork of the cap tray.
 */

import { memo } from "react";
import { StyleSheet } from "react-native";
import Svg, { Defs, G, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";

export const WoodGrain = memo(function WoodGrain({ w, h }: Readonly<{ w: number; h: number }>) {
  const lines = Math.max(1, Math.floor(h / 11));
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F0C68C" />
          <Stop offset="1" stopColor="#DFA765" />
        </LinearGradient>
        <RadialGradient id="woodHi" cx="0.5" cy="0" rx="0.6" ry="0.9">
          <Stop offset="0" stopColor="#fff" stopOpacity={0.32} />
          <Stop offset="0.62" stopColor="#fff" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={w} height={h} fill="url(#wood)" />
      <G>
        {Array.from({ length: lines }, (_, i) => (
          <Rect key={i} x={0} y={i * 11 + 4} width={w} height={2} fill="rgb(150,92,40)" opacity={0.11} />
        ))}
      </G>
      <Rect width={w} height={h} fill="url(#woodHi)" />
    </Svg>
  );
});
