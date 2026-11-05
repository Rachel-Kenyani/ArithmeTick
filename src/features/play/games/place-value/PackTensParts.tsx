import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import type { CounterItem } from "@/features/play/components/CounterFace";

import { DragItem } from "./DragItem";
import { Crate, Loose, TARGET, partStyles, type Bubble } from "./parts";
import { around, itemWord } from "./packTensLogic";

export function PackCrate({
  item,
  cell,
  inCrate,
  handFilled,
  glow,
  onPress,
}: Readonly<{
  item: CounterItem;
  cell: number;
  inCrate: number;
  handFilled: boolean;
  glow: boolean;
  onPress: () => void;
}>) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Crate, ${inCrate} of 10${handFilled ? ". Tap to fill it" : ""}`}
      style={({ pressed }) => [pressed && handFilled ? styles.pressed : null]}
    >
      <Crate item={item} cell={cell} filled={inCrate} glow={glow} countLast />
    </Pressable>
  );
}

export function LooseSlot({
  item,
  pitch,
  size,
  packed,
  packing,
  bubble,
  onTap,
  onDrop,
}: Readonly<{
  item: CounterItem;
  pitch: number;
  size: number;
  packed: boolean;
  packing: boolean;
  bubble?: Bubble;
  onTap: () => void;
  onDrop: (x: number, y: number) => void;
}>) {
  return (
    <View style={[styles.slot, { width: pitch, height: pitch }]}>
      {packed ? null : (
        <DragItem
          enabled={packing}
          onTap={onTap}
          onDrop={onDrop}
          hitSlop={Math.max(0, Math.ceil((TARGET - pitch) / 2))}
          label={
            packing
              ? `${itemWord(item)}. Tap or drag it onto the crate`
              : itemWord(item)
          }
        >
          <Loose item={item} size={size} bubble={bubble} />
        </DragItem>
      )}
    </View>
  );
}

export function Choices({
  unit,
  target,
  onPick,
}: Readonly<{
  unit: "hundreds" | "tens" | "ones";
  target: number;
  onPick: (n: number) => void;
}>) {
  return (
    <Animated.View entering={FadeIn.duration(220)} style={partStyles.choices}>
      {around(target).map((n) => (
        <Pressable
          key={n}
          onPress={() => onPick(n)}
          accessibilityRole="button"
          accessibilityLabel={`${n} ${unit}`}
          style={partStyles.choice}
        >
          <Text style={partStyles.choiceText}>{n}</Text>
        </Pressable>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  slot: { alignItems: "center", justifyContent: "center" },
  pressed: { transform: [{ scale: 0.97 }] },
});
