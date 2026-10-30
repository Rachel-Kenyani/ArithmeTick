/**
 * Shared bits for the hand-authored illustrations: the chunky outline, the 64×64 frame and a
 * reusable star path. Flat shapes only (no filters / masks) so they stay cheap on budget phones.
 */

import type { ReactNode } from "react";
import Svg from "react-native-svg";

import { a11y } from "@/components/ui/icons/make";

/** Chunky dark outline used by every illustration. */
export const OUTLINE = "#1b1b1b";
export const STROKE = 2.4;

/** Common stroke props for an outlined shape. */
export const ink = {
  stroke: OUTLINE,
  strokeWidth: STROKE,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export interface ArtProps {
  /** px; default 64 */
  size?: number;
  /** When set, the art is announced (accessible image); otherwise hidden from assistive tech. */
  title?: string;
}

export function ArtFrame({ size = 64, title, children }: Readonly<ArtProps & { children: ReactNode }>) {
  return (
    <Svg viewBox="0 0 64 64" width={size} height={size} {...a11y(title)}>
      {children}
    </Svg>
  );
}

/** 5-point star path centred on (cx, cy) with outer radius r. */
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
