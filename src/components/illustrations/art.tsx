import type { ReactNode } from "react";
import Svg from "react-native-svg";

import { a11y } from "@/components/ui/icons/make";

export const OUTLINE = "#1b1b1b";
export const STROKE = 2.4;

export const ink = {
  stroke: OUTLINE,
  strokeWidth: STROKE,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export interface ArtProps {
  size?: number;
  title?: string;
}

export function ArtFrame({ size = 64, title, children }: Readonly<ArtProps & { children: ReactNode }>) {
  return (
    <Svg viewBox="0 0 64 64" width={size} height={size} {...a11y(title)}>
      {children}
    </Svg>
  );
}

export function starPath(cx: number, cy: number, r: number): string {
  const inner = r * 0.48;
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}
