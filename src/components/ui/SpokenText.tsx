/**
 * Text that lights up word by word while Brijo reads it (narration.ts), so a child can follow the words with
 * their eyes, or a grown-up with a finger. Renders as plain text when it isn't being read.
 */

import { useSyncExternalStore } from "react";
import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";

import { narration, wordsOf } from "@/services/narration";
import { colors } from "@/theme";

export default function SpokenText({ text, style }: Readonly<{ text: string; style?: StyleProp<TextStyle> }>) {
  const spoken = useSyncExternalStore(narration.subscribe, narration.current);
  const range = spoken?.text === text ? spoken : null;
  const words = wordsOf(text);
  return (
    <Text style={style} accessibilityLabel={text}>
      {words.map((w, i) => {
        const lit = range !== null && i >= range.from && i < range.to;
        return (
          <Text key={i}>
            {i > 0 ? " " : ""}
            <Text style={lit ? styles.lit : null}>{w}</Text>
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  lit: { backgroundColor: colors.atYellowSoft, color: colors.atInk, borderRadius: 4 },
});
