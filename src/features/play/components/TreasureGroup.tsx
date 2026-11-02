import { StyleSheet, View } from "react-native";
import Animated, { ReduceMotion, ZoomIn } from "react-native-reanimated";

import CounterFace, { type CounterItem } from "@/features/play/components/CounterFace";

const ROW = 5;

export default function TreasureGroup({ id, count, size = 34, animate = false }: Readonly<{ id: CounterItem; count: number; size?: number; animate?: boolean }>) {
  const rows = Array.from({ length: Math.ceil(count / ROW) }, (_, r) => Math.min(ROW, count - r * ROW));
  return (
    <View style={styles.group}>
      {rows.map((n, r) => (
        <View key={r} style={styles.row}>
          {Array.from({ length: n }, (_, c) => {
            const i = r * ROW + c;
            return (
              <Animated.View key={i} style={{ width: size, height: size }} entering={animate ? ZoomIn.delay(250 + i * 70).springify().stiffness(320).damping(18).reduceMotion(ReduceMotion.System) : undefined}>
                <CounterFace item={id} palette={i % 3 === 2 ? "purple" : "teal"} size={size} />
              </Animated.View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 4, alignItems: "center" },
  row: { flexDirection: "row", gap: 4 },
});
