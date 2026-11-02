import { StyleSheet, View } from "react-native";

import TreasureArt, { type TreasureId } from "@/components/illustrations/TreasureArt";
import { CapFace } from "@/features/play/games/ten-frame/components/CapFace";

export type CounterItem = TreasureId | "cap";

export default function CounterFace({ item, palette, size }: Readonly<{ item: CounterItem; palette: "teal" | "purple" | "gold" | "mint"; size: number }>) {
  if (item === "cap") return <CapFace palette={palette} />;
  return (
    <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]} pointerEvents="none">
      <TreasureArt id={item} size={size} />
    </View>
  );
}
