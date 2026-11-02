import type { LevelDef, LevelStatus } from "@/data/levels";

export interface LevelNodeProps {
  level: LevelDef;
  status: LevelStatus;
  size: number;
  x: number;
  y: number;
  side: "left" | "right";
  pop?: number;
  onPlay: (level: LevelDef) => void;
}
