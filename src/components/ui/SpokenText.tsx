import { useSyncExternalStore } from "react";
import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";

import { narration } from "@/services/narration";
import { colors } from "@/theme";

export default function SpokenText({
  text,
  style,
  source = text,
  offset = 0,
}: Readonly<{ text: string; style?: StyleProp<TextStyle>; source?: string; offset?: number }>) {
  const spoken = useSyncExternalStore(narration.subscribe, narration.current);
  const range = spoken?.text === source ? spoken : null;
  const words = [...text.matchAll(/\S+/g)].map((m) => ({ word: m[0], at: m.index }));
  return (
    <Text style={style} accessibilityLabel={text}>
      {words.map(({ word, at }, i) => {
        const lit = range !== null && i + offset >= range.from && i + offset < range.to;
        return (
          <Text key={at}>
            {i > 0 ? " " : ""}
            <Text style={lit ? styles.lit : null}>{word}</Text>
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  lit: { backgroundColor: colors.atYellowSoft, color: colors.atInk, borderRadius: 4 },
});
