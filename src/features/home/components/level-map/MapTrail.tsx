/** The level map's sandy, pebbled SVG trail. */

import { StyleSheet, View } from "react-native";
import Svg, { G, Path } from "react-native-svg";

import WalkedLeg from "@/features/home/components/level-map/WalkedLeg";
import { BLEED, PEBBLE, SAND, WALKED } from "@/features/home/components/level-map/constants";
import type { MapLayout } from "@/features/home/components/level-map/computeLayout";

/** The sandy trail: outline, fill, highlight and pebbles (white where the explorer has already walked). */
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
          <G stroke="#1b1b1b" strokeOpacity={0.82} strokeWidth={layout.trail + 6}>
            <Path d={layout.leadIn} />
            {layout.segments.map((d) => (
              <Path key={d} d={d} />
            ))}
            <Path d={layout.leadOut} />
          </G>
          <G stroke={SAND} strokeWidth={layout.trail}>
            <Path d={layout.leadIn} />
            {layout.segments.map((d) => (
              <Path key={d} d={d} />
            ))}
            <Path d={layout.leadOut} />
          </G>
          {/* soft highlight along the trail's upper edge */}
          <G stroke="#fff4d6" strokeOpacity={0.7} strokeWidth={layout.trail * 0.28} transform="translate(-2 -3)">
            {layout.segments.map((d) => (
              <Path key={d} d={d} />
            ))}
          </G>
          {/* pebbles: white where the explorer has already walked */}
          <G strokeWidth={layout.big ? 8 : 7} strokeDasharray={[0.1, 17]}>
            <Path d={layout.leadIn} stroke={WALKED} />
            {layout.segments.map((d, i) => (
              <G key={d}>
                <Path d={d} stroke={PEBBLE} />
                {i !== unlockSegment && walked(i) ? <Path d={d} stroke={WALKED} /> : null}
              </G>
            ))}
            <Path d={layout.leadOut} stroke={allDone ? WALKED : PEBBLE} />
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
