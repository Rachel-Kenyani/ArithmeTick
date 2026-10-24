/** The level map's warm dirt trail, with a lighter walking lane and small stepping stones. */

import { StyleSheet, View } from "react-native";
import Svg, { G, Path } from "react-native-svg";

import WalkedLeg from "@/features/home/components/level-map/WalkedLeg";
import { BLEED, PEBBLE, SAND, WALKED } from "@/features/home/components/level-map/constants";
import type { MapLayout } from "@/features/home/components/level-map/computeLayout";

/** One clean, continuous trail that finishes at the purple flag pole. */
export default function MapTrail({
  layout,
  unlockSegment,
  allDone,
  walked,
}: Readonly<{ layout: MapLayout; unlockSegment: number; allDone: boolean; walked: (segmentIndex: number) => boolean }>) {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      <Svg
        width={layout.width}
        height={layout.height + BLEED}
        viewBox={`0 0 ${layout.width} ${layout.height + BLEED}`}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <G fill="none" strokeLinecap="round" strokeLinejoin="round">
          <G stroke="#8d6a43" strokeOpacity={0.72} strokeWidth={layout.trail + 5}>
            <Path d={layout.trailPath} />
          </G>
          <G stroke={SAND} strokeWidth={layout.trail - 1}>
            <Path d={layout.trailPath} />
          </G>
          <G stroke="#fff2cf" strokeOpacity={0.64} strokeWidth={layout.trail * 0.16} transform="translate(-1 -2)">
            <Path d={layout.trailPath} />
          </G>
          {/* Stepping stones show the portion already travelled, including the finish when the world is complete. */}
          <G strokeWidth={layout.big ? 8 : 7} strokeDasharray={[0.1, 17]}>
            {layout.segments.map((d, i) => (
              <G key={d}>
                <Path d={d} stroke={PEBBLE} />
                {i !== unlockSegment && walked(i) ? <Path d={d} stroke={WALKED} /> : null}
              </G>
            ))}
            <Path d={layout.finishSegment} stroke={allDone ? WALKED : PEBBLE} />
          </G>
        </G>
      </Svg>
      {unlockSegment >= 0 && unlockSegment < layout.segments.length ? (
        <WalkedLeg
          width={layout.width}
          height={layout.height + BLEED}
          d={layout.segments[unlockSegment]}
          strokeWidth={layout.big ? 8 : 7}
          visible={walked(unlockSegment)}
        />
      ) : null}
    </View>
  );
}
