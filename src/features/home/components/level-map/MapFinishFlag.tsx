/** The finish flag at the top of the level map. */

import { FinishFlag } from "@/features/home/components/TrailArt";
import type { MapLayout } from "@/features/home/components/level-map/computeLayout";

/** The purple finish flag planted exactly where the final trail leg ends. */
export default function MapFinishFlag({ layout }: Readonly<{ layout: MapLayout }>) {
  const size = layout.big ? 64 : 56;
  return (
    <FinishFlag
      size={size}
      style={{
        position: "absolute",
        left: layout.flag.x - size * (20 / 64),
        top: layout.flag.y - (size * 88) / 64 + (layout.big ? 10 : 8),
      }}
    />
  );
}
