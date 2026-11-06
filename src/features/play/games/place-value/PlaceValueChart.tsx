import { StyleSheet, Text, View } from "react-native";
import Animated, { ReduceMotion, ZoomIn } from "react-native-reanimated";

import { colors, fonts } from "@/theme";

import { NumberTile } from "../ten-frame/components/NumberTile";

export type Place = "hundreds" | "tens" | "ones";

export const PLACE_COLORS: Record<Place, string> = {
  hundreds: "#006a62",
  tens: "#5a3596",
  ones: "#c99a1c",
};

export const CHART_HEIGHT = 112;

const PLACE_VALUE: Record<Place, number> = { hundreds: 100, tens: 10, ones: 1 };
const POP = ZoomIn.springify()
  .stiffness(380)
  .damping(20)
  .reduceMotion(ReduceMotion.System);

export function placeValueLabel(place: Place, digit: number): string {
  const width = String(PLACE_VALUE[place]).length;
  return digit === 0 ? "0".repeat(width) : String(digit * PLACE_VALUE[place]);
}

export default function PlaceValueChart({
  total,
  places,
  digits,
  solved,
}: Readonly<{
  total: number;
  places: Place[];
  digits: Partial<Record<Place, number>>;
  solved: boolean;
}>) {
  const known = places
    .map((place) => `${digits[place] ?? "how many"} ${place}`)
    .join(", ");
  return (
    <View
      style={[styles.strip, solved ? styles.stripWin : null]}
      accessible
      accessibilityLabel={`${total} is ${known}`}
    >
      <NumberTile value={total} tone="total" size={48} fontSize={22} />
      <Text style={styles.op}>=</Text>
      <View style={styles.chart}>
        {places.map((place, i) => {
          const digit = digits[place];
          return (
            <View
              key={place}
              style={[styles.column, i > 0 ? styles.divider : null]}
            >
              <Text
                style={styles.head}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {place}
              </Text>
              <View style={styles.digitCell}>
                {digit === undefined ? (
                  <Text style={[styles.digit, styles.ask]}>?</Text>
                ) : (
                  <Animated.Text
                    entering={POP}
                    style={[styles.digit, { color: PLACE_COLORS[place] }]}
                  >
                    {digit}
                  </Animated.Text>
                )}
              </View>
              <Text style={styles.value}>
                {digit === undefined ? " " : placeValueLabel(place, digit)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const LINE = "rgba(0,79,74,0.35)";

const styles = StyleSheet.create({
  strip: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.atMintDeep,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  stripWin: { borderColor: "#E0A800", backgroundColor: colors.atCream },
  op: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.atInk },
  chart: {
    flexShrink: 1,
    flexDirection: "row",
    borderWidth: 2,
    borderColor: LINE,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  column: { flexBasis: 74, flexShrink: 1, minWidth: 62, alignItems: "stretch" },
  divider: { borderLeftWidth: 2, borderLeftColor: LINE },
  head: {
    textAlign: "center",
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.atInk,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 2,
    borderBottomColor: LINE,
    backgroundColor: colors.atCream,
  },
  digitCell: { height: 36, alignItems: "center", justifyContent: "center" },
  digit: { fontFamily: fonts.headingBold, fontSize: 26, lineHeight: 32 },
  ask: { color: colors.atTeal, opacity: 0.45 },
  value: {
    textAlign: "center",
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.atInk,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderTopWidth: 2,
    borderTopColor: LINE,
  },
});
