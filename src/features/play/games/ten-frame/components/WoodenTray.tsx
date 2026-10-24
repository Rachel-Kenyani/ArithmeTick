/**
 * Wooden tray of vifuniko (decorative; the caps themselves are the accessible elements).
 */

import { View } from "react-native";

import { CAP_IDS } from "../constants";
import { trayDimpleBorder } from "../logic/caps";
import { styles } from "../styles";
import type { BoardLayout, Pt, Rect4 } from "../types";
import { WoodGrain } from "./WoodGrain";

export function WoodenTray({ layout: L, tray, homes }: Readonly<{ layout: BoardLayout; tray: Rect4; homes: Pt[] }>) {
  return (
    <>
      <View
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={[styles.abs, { left: tray.x, top: tray.y + 6, width: tray.w, height: tray.h, borderRadius: 28, backgroundColor: "#8A5222" }]}
      />
      <View
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={[styles.abs, styles.tray, { left: tray.x, top: tray.y, width: tray.w, height: tray.h, borderWidth: L.trayBorder }]}
      >
        <WoodGrain w={tray.w} h={tray.h} />
      </View>
      {CAP_IDS.map((id) => (
        <View
          key={id}
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={[
            styles.abs,
            styles.trayDimple,
            {
              left: homes[id].x - L.cap * 0.42,
              top: homes[id].y - L.cap * 0.42,
              width: L.cap * 0.84,
              height: L.cap * 0.84,
              borderRadius: L.cap,
              borderColor: trayDimpleBorder(id),
            },
          ]}
        />
      ))}
    </>
  );
}
