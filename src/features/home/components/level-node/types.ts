/** Props shared by the level-map stop and its pieces. */

import type { LevelDef, LevelStatus } from "@/data/levels";

export interface LevelNodeProps {
  level: LevelDef;
  status: LevelStatus;
  /** Coin diameter in px. */
  size: number;
  /** Centre of the coin in map coordinates (px). */
  x: number;
  y: number;
  /** Which column of the zig-zag the stop is in (ornaments go on the inner side, Jaymo stands on the outer side). */
  side: "left" | "right";
  /** Increment to play the "just unlocked" bounce. */
  pop?: number;
  onPlay: (level: LevelDef) => void;
}
