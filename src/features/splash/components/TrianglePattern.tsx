/**
 * Splash intro — the teal triangle-pattern backdrop (frames 1–5), also drawn over the sky gradient (frame 6 on).
 */

import { StyleSheet } from "react-native";
import Svg, {
  Defs,
  G,
  LinearGradient,
  Path,
  Pattern,
  Rect,
  Stop,
} from "react-native-svg";

import { BG, TRI } from "../constants";

/**
 * The repeating triangle tile shared by light-background.svg and sky-background.svg (one 33.9 × 34 cell; edge
 * shapes duplicated) over `sky` ? the sky gradient : the pale teal.
 */
export default function TrianglePattern({ sky = false }: Readonly<{ sky?: boolean }>) {
  const id = sky ? "splash-tri-sky" : "splash-tri";
  const up =
    "M-5.5 17.9H-13.8C-15.3 17.9 -16.2 16.3 -15.5 15L-7.2 0.65C-6.4 -0.64 -4.6 -0.64 -3.8 0.65L4.5 15C5.2 16.3 4.3 17.9 2.8 17.9Z";
  const down =
    "M10.6 -8.8H18.9C20.4 -8.8 21.4 -7.2 20.6 -5.9L12.3 8.45C11.6 9.75 9.7 9.75 8.95 8.45L0.67 -5.9C-0.08 -7.2 0.86 -8.8 2.36 -8.8Z";
  const ring =
    "M10.6 21.2C10.1 21.2 9.7 20.9 9.4 20.4L-7.6 -11C-7.85 -11.4 -7.84 -11.9 -7.6 -12.3C-7.35 -12.7 -6.9 -13 -6.4 -13H27.7C28.2 -13 28.6 -12.7 28.9 -12.3C29.1 -11.9 29.1 -11.4 28.9 -11L11.8 20.4C11.6 20.9 11.1 21.2 10.6 21.2ZM-4.1 -10.3L10.6 16.9L25.4 -10.3Z";
  const cell = (dx: number) => (
    <G transform={`translate(${dx} 13)`}>
      <Path d={up} fill={TRI} fillOpacity={0.1} />
      <Path d={down} fill={TRI} fillOpacity={0.1} />
      <Path d={ring} fill={TRI} fillOpacity={0.1} fillRule="evenodd" />
    </G>
  );
  return (
    <Svg style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="splash-sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset={0} stopColor="#0E6BB6" />
          <Stop offset={0.5} stopColor="#8CCFE3" />
          <Stop offset={1} stopColor="#D1FAD6" />
        </LinearGradient>
        <Pattern
          id={id}
          patternUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={33.9}
          height={34}
        >
          {cell(0)}
          {cell(33.9)}
          <Rect
            x={0}
            y={32.3}
            width={33.9}
            height={2.7}
            fill={TRI}
            fillOpacity={0.1}
          />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={sky ? "url(#splash-sky)" : BG} />
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
