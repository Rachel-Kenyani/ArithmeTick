/**
 * What the child counts with: a bottle top (vifuniko) or the level's story item (feathers, shells…), so the
 * board matches the story. Fills its parent box.
 */

import { StyleSheet, View } from "react-native";

import TreasureArt, { type TreasureId } from "@/components/illustrations/TreasureArt";
import { CapFace } from "@/features/play/games/ten-frame/components/CapFace";

/** "cap" = a bottle top; anything else is drawn with TreasureArt. */
export type CounterItem = TreasureId | "cap";

export default function CounterFace({ item, palette, size }: Readonly<{ item: CounterItem; palette: "teal" | "purple" | "gold" | "mint"; size: number }>) {
  if (item === "cap") return <CapFace palette={palette} />;
  return (
    <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]} pointerEvents="none">
      <TreasureArt id={item} size={size} />
    </View>
  );
}
