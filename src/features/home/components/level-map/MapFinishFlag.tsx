/** The finish flag at the top of the level map. */

import { FinishFlag } from "@/features/home/components/TrailArt";
import type { MapLayout } from "@/features/home/components/level-map/computeLayout";

/** The finish flag planted at the end of the lead-out. */
export default function MapFinishFlag({ layout }: Readonly<{ layout: MapLayout }>) {
  const size = layout.big ? 60 : 48;
  return (
    <FinishFlag
      size={size}
      style={{
        position: "absolute",
        left: layout.flag.x - size * (20 / 64),
        top: layout.flag.y - (size * 80) / 64 + (layout.big ? 8 : 6),
      }}
    />
  );
}
