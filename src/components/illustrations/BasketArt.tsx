/**
 * Brijo's woven basket: a round handle, a rim and a criss-cross weave, in a 220×120 viewBox stretched to its
 * box. Items sit in the opening (the top ~40%), drawn by the parent on top of the art.
 */

import { StyleSheet } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

const INK = "#1b1b1b";
const WEAVE = "#a86f33";

export default function BasketArt() {
  return (
    <Svg viewBox="0 0 220 120" preserveAspectRatio="none" width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* handle, behind everything */}
      <Path d="M44 52 C44 0 176 0 176 52" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <Path d="M44 52 C44 0 176 0 176 52" fill="none" stroke="#c98a45" strokeWidth={8} strokeLinecap="round" />
      {/* body: wider at the top, flat base */}
      <Path d="M16 56 L204 56 L186 114 L34 114 Z" fill="#d9a05b" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      {/* criss-cross weave */}
      <Path d="M40 60 L64 112 M72 60 L96 112 M104 60 L128 112 M136 60 L160 112 M168 60 L186 100 M26 80 L38 112" stroke={WEAVE} strokeWidth={4} strokeLinecap="round" />
      <Path d="M56 60 L36 104 M88 60 L66 112 M120 60 L98 112 M152 60 L130 112 M184 60 L162 112 M200 66 L192 86" stroke={WEAVE} strokeWidth={4} strokeLinecap="round" />
      {/* horizontal bands */}
      <Path d="M24 80 L196 80 M30 98 L190 98" stroke="#8a5523" strokeWidth={3} />
      {/* rim */}
      <Rect x={8} y={48} width={204} height={14} rx={7} fill="#b97a38" stroke={INK} strokeWidth={3} />
    </Svg>
  );
}
