/**
 * Bottle-cap artwork: crown-cap palettes, the crimped silhouette and the fading group-tone overlay.
 */

import { memo, useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from "react-native-svg";

import type { PaletteKey } from "../types";
import { RM } from "../utils/motion";

const PALETTES: Record<
  PaletteKey,
  { light: string; base: string; dark: string; stroke: string; discIn: string; discOut: string }
> = {
  teal: { light: "#3DBDB2", base: "#0B867D", dark: "#00524D", stroke: "#003B37", discIn: "#2AAA9F", discOut: "#00736B" },
  purple: { light: "#AD88DC", base: "#7A4EB5", dark: "#43246C", stroke: "#2E1850", discIn: "#9D73D3", discOut: "#6A3FA0" },
  gold: { light: "#FFEDB0", base: "#FFC107", dark: "#C48A00", stroke: "#8A6100", discIn: "#FFE27F", discOut: "#FFB300" },
  mint: { light: "#E6FFF7", base: "#7FF0C9", dark: "#2DBE93", stroke: "#11765B", discIn: "#C6FCEA", discOut: "#5BE0B3" },
};

/** Crown-cap silhouette: 21 rounded crimps (real crown caps have 21 flutes). */
function crimpPath(teeth = 21, rOuter = 48.5, rInner = 44, c = 50): string {
  const n = teeth * 2;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? rOuter : rInner;
    return [c + r * Math.cos(a), c + r * Math.sin(a)] as const;
  });
  const f = (v: number) => v.toFixed(1);
  const mid = (i: number) => {
    const p = pts[i % n];
    const q = pts[(i + 1) % n];
    return `${f((p[0] + q[0]) / 2)} ${f((p[1] + q[1]) / 2)}`;
  };
  let d = `M ${mid(n - 1)}`;
  for (let i = 0; i < n; i += 1) d += ` Q ${f(pts[i][0])} ${f(pts[i][1])} ${mid(i)}`;
  return `${d} Z`;
}
const CRIMP_PATH = crimpPath();

/** Static artwork (never animated itself — the Animated.Views around it move). */
export const CapFace = memo(function CapFace({ palette }: Readonly<{ palette: PaletteKey }>) {
  const p = PALETTES[palette];
  const rim = `rim-${palette}`;
  const disc = `disc-${palette}`;
  return (
    <Svg viewBox="0 0 100 100" width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={rim} x1="0.15" y1="0.05" x2="0.85" y2="0.95">
          <Stop offset="0" stopColor={p.light} />
          <Stop offset="0.55" stopColor={p.base} />
          <Stop offset="1" stopColor={p.dark} />
        </LinearGradient>
        <RadialGradient id={disc} cx="0.4" cy="0.34" r="0.78">
          <Stop offset="0" stopColor={p.discIn} />
          <Stop offset="1" stopColor={p.discOut} />
        </RadialGradient>
      </Defs>
      {/* crimped skirt */}
      <Path d={CRIMP_PATH} fill={`url(#${rim})`} stroke={p.stroke} strokeWidth={2.6} strokeLinejoin="round" />
      {/* inner lip shadow */}
      <Circle cx="50" cy="50" r="37.5" fill={p.dark} opacity={0.5} />
      {/* top disc */}
      <Circle cx="50" cy="51" r="34" fill={`url(#${disc})`} stroke={p.stroke} strokeOpacity={0.35} strokeWidth={1.5} />
      {/* embossed ring */}
      <Circle cx="50" cy="51" r="24.5" fill="none" stroke="#fff" strokeOpacity={0.24} strokeWidth={2.6} />
      {/* gloss */}
      <Path d="M26 42 A26 26 0 0 1 46 25" fill="none" stroke="#fff" strokeOpacity={0.62} strokeWidth={5.5} strokeLinecap="round" />
      <Circle cx="57" cy="24.5" r="2.6" fill="#fff" fillOpacity={0.72} />
    </Svg>
  );
});

/** A group-tone face laid over the cap; fades in/out (web: AnimatePresence, 0.35s, staggered by slot). */
export function ToneOverlay({ tone, on, delayMs }: Readonly<{ tone: PaletteKey; on: boolean; delayMs: number }>) {
  const o = useSharedValue(0);
  useEffect(() => {
    o.set(withDelay(on ? delayMs : 0, withTiming(on ? 1 : 0, { duration: 350, reduceMotion: RM }), RM));
  }, [on, delayMs, o]);
  const st = useAnimatedStyle(() => ({ opacity: o.get() }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, st]}>
      <CapFace palette={tone} />
    </Animated.View>
  );
}
