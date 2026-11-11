import { Defs, Ellipse, G, Path, RadialGradient, Stop } from "react-native-svg";

const EDGE = "#9c6a35";
const CRUST = "#dcae6c";
const MIDDLE = "#f6dfa9";
const BROWN = "#b5733a";
const CHAR = "#7d4a22";
const LAYER = "#c99256";

/** Browned blisters, as fractions of the radius: where the chapati touched the pan. */
const BLISTERS = [
  { id: "b1", x: -0.48, y: -0.32, rx: 0.13, ry: 0.08, turn: -20 },
  { id: "b2", x: 0.34, y: -0.52, rx: 0.1, ry: 0.06, turn: 15 },
  { id: "b3", x: 0.52, y: 0.22, rx: 0.14, ry: 0.07, turn: 40 },
  { id: "b4", x: -0.22, y: 0.55, rx: 0.12, ry: 0.07, turn: -10 },
  { id: "b5", x: 0.08, y: -0.12, rx: 0.08, ry: 0.05, turn: 60 },
  { id: "b6", x: -0.62, y: 0.18, rx: 0.07, ry: 0.05, turn: 0 },
  { id: "b7", x: 0.2, y: 0.38, rx: 0.07, ry: 0.04, turn: -35 },
] as const;

/** Small dark specks inside some blisters. */
const SPECKS = [
  { id: "c1", x: -0.45, y: -0.3, r: 0.03 },
  { id: "c2", x: 0.55, y: 0.2, r: 0.035 },
  { id: "c3", x: -0.2, y: 0.53, r: 0.025 },
  { id: "c4", x: 0.36, y: -0.5, r: 0.02 },
] as const;

/** A hand-rolled edge: a circle that wobbles a little, so it does not look drawn with a compass. */
export function chapatiOutline(r: number, cx = 0, cy = 0): string {
  const steps = 72;
  const points = Array.from({ length: steps }, (_, i) => {
    const a = (i / steps) * Math.PI * 2;
    const k = 1 + 0.014 * Math.sin(3 * a + 0.6) + 0.008 * Math.sin(7 * a + 2.1) + 0.005 * Math.sin(11 * a);
    return `${(cx + Math.cos(a) * r * k).toFixed(2)} ${(cy + Math.sin(a) * r * k).toFixed(2)}`;
  });
  return `M${points.join("L")}Z`;
}

/** The faint spiral of a layered chapati. */
function layerSpiral(r: number): string {
  const steps = 90;
  const turns = 2.4;
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    const d = r * (0.12 + 0.62 * t);
    return `${(Math.cos(a) * d).toFixed(2)} ${(Math.sin(a) * d).toFixed(2)}`;
  });
  return `M${points.join("L")}`;
}

/**
 * A cooked chapati centred on 0,0. `id` keeps the gradient name unique when several chapatis share a screen;
 * `outline` sets the edge colour and width (the treasure uses the thick ink outline of the other treasures).
 */
export function ChapatiBody({ r, id, outline = EDGE, outlineWidth = 2 }: Readonly<{ r: number; id: string; outline?: string; outlineWidth?: number }>) {
  const fill = `chapati-${id}`;
  return (
    <G>
      <Defs>
        <RadialGradient id={fill} cx="45%" cy="42%" r="60%">
          <Stop offset="0" stopColor={MIDDLE} />
          <Stop offset="0.7" stopColor="#efcb8a" />
          <Stop offset="1" stopColor={CRUST} />
        </RadialGradient>
      </Defs>
      <Path d={chapatiOutline(r)} fill={`url(#${fill})`} stroke={outline} strokeWidth={outlineWidth} strokeLinejoin="round" />
      <Path d={layerSpiral(r)} fill="none" stroke={LAYER} strokeWidth={Math.max(1, r * 0.018)} strokeLinecap="round" opacity={0.45} />
      {BLISTERS.map((b) => (
        <Ellipse key={b.id} cx={b.x * r} cy={b.y * r} rx={b.rx * r} ry={b.ry * r} fill={BROWN} opacity={0.55} transform={`rotate(${b.turn} ${b.x * r} ${b.y * r})`} />
      ))}
      {SPECKS.map((s) => (
        <Ellipse key={s.id} cx={s.x * r} cy={s.y * r} rx={s.r * r} ry={s.r * r * 0.8} fill={CHAR} opacity={0.7} />
      ))}
    </G>
  );
}

export const CHAPATI_EDGE = EDGE;
