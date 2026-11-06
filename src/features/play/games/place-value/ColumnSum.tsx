import { useEffect, useState } from "react";
import { StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { Easing, ReduceMotion, ZoomIn, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { colors, fonts } from "@/theme";

import { PLACE_COLORS, type Place } from "./PlaceValueChart";
import { digitsOf } from "./columnsLogic";

const PLACES: Place[] = ["hundreds", "tens", "ones"];
const POP = ZoomIn.springify().stiffness(380).damping(20).reduceMotion(ReduceMotion.System);

/** How long a carried or borrowed 1 takes to travel between columns. */
export const FLY_MS = 900;

/** A 1 moving between columns: carried up to the next column, or borrowed down into the one on its right. */
export interface Flight {
  key: string;
  from: Place;
  fromRow: "carry" | "answer";
  to: Place;
  label: string;
}

type Spots = { x: Partial<Record<Place, number>>; top: number; width: number; carryY: number; answerY: number };

/**
 * A sum written in place-value columns, as in a Grade 3 exercise book: carried 1s above the columns, the two
 * numbers, a line, and the answer row, which fills in one column at a time. When subtracting, a borrowed-from
 * digit is crossed out and its new value written small above it.
 */
export default function ColumnSum({
  op,
  a,
  b,
  carried,
  rewritten = {},
  answer,
  focus,
  solved,
  flight,
}: Readonly<{
  op: "add" | "sub";
  a: number;
  b: number;
  carried: Partial<Record<Place, boolean>>;
  rewritten?: Partial<Record<Place, number>>;
  answer: Partial<Record<Place, number>>;
  focus: Place | null;
  solved: boolean;
  flight?: Flight | null;
}>) {
  const [spots, setSpots] = useState<Spots>({ x: {}, top: 0, width: 0, carryY: 0, answerY: 0 });
  const placeColumn = (place: Place) => (e: LayoutChangeEvent) => {
    const { x, y, width } = e.nativeEvent.layout;
    setSpots((prev) => (prev.x[place] === x && prev.width === width && prev.top === y ? prev : { ...prev, x: { ...prev.x, [place]: x }, top: y, width }));
  };
  const rowAt = (row: "carryY" | "answerY") => (e: LayoutChangeEvent) => {
    const { y, height } = e.nativeEvent.layout;
    const mid = y + height / 2;
    setSpots((prev) => (prev[row] === mid ? prev : { ...prev, [row]: mid }));
  };
  const top = digitsOf(a);
  const bottom = digitsOf(b);
  const sign = op === "add" ? "+" : "−";
  const shown = PLACES.map((p) => answer[p] ?? "blank").join(", ");
  const written = (n: number, place: Place, d: number) => ((n < 100 && place === "hundreds") || (n < 10 && place === "tens") ? " " : String(d));

  return (
    <View style={[styles.card, solved ? styles.cardWin : null]} accessibilityLabel={`${a} ${op === "add" ? "plus" : "take away"} ${b}. Answer so far: ${shown}`}>
      <View style={styles.signColumn}>
        <Text style={styles.head}> </Text>
        <View style={styles.carryCell} />
        <Text style={styles.digit}> </Text>
        <Text style={styles.digit}>{sign}</Text>
      </View>
      {PLACES.map((place) => {
        const digit = answer[place];
        return (
          <View key={place} onLayout={placeColumn(place)} style={[styles.column, focus === place ? styles.focus : null]}>
            <Text style={styles.head} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              {place}
            </Text>
            <View style={styles.carryCell} onLayout={place === "ones" ? rowAt("carryY") : undefined}>
              {carried[place] ? (
                <Animated.Text entering={POP} style={[styles.carry, { color: PLACE_COLORS[place] }]}>
                  1
                </Animated.Text>
              ) : null}
              {rewritten[place] === undefined ? null : (
                <Animated.Text key={rewritten[place]} entering={POP} style={[styles.carry, styles.rewritten]}>
                  {rewritten[place]}
                </Animated.Text>
              )}
            </View>
            <Text style={[styles.digit, { color: PLACE_COLORS[place] }, rewritten[place] === undefined ? null : styles.crossed]}>{written(a, place, top[place])}</Text>
            <Text style={[styles.digit, { color: PLACE_COLORS[place] }]}>{written(b, place, bottom[place])}</Text>
            <View style={styles.rule} />
            <View onLayout={place === "ones" ? rowAt("answerY") : undefined}>
              {digit === undefined ? (
                <Text style={[styles.digit, styles.ask]}>?</Text>
              ) : (
                <Animated.Text key={digit} entering={POP} style={[styles.digit, { color: PLACE_COLORS[place] }]}>
                  {digit}
                </Animated.Text>
              )}
            </View>
          </View>
        );
      })}
      {flight ? <FlyingOne key={flight.key} flight={flight} spots={spots} /> : null}
    </View>
  );
}

/** The 1 travelling between columns, in an arc, from where it was made to where it is written. */
function FlyingOne({ flight, spots }: Readonly<{ flight: Flight; spots: Spots }>) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  const fromX = spots.x[flight.from] ?? 0;
  const toX = spots.x[flight.to] ?? 0;
  const fromY = spots.top + (flight.fromRow === "carry" ? spots.carryY : spots.answerY);
  const toY = spots.top + spots.carryY;
  useEffect(() => {
    t.set(withTiming(1, { duration: reduced ? 1 : FLY_MS, easing: Easing.inOut(Easing.cubic) }));
  }, [t, reduced]);
  const style = useAnimatedStyle(() => {
    const p = t.get();
    return {
      transform: [{ translateX: fromX + (toX - fromX) * p }, { translateY: fromY + (toY - fromY) * p - Math.sin(p * Math.PI) * 28 - 16 }, { scale: 1 + Math.sin(p * Math.PI) * 0.35 }],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[styles.flying, { width: spots.width }, style]}>
      <View style={styles.flyingChip}>
        <Text style={styles.flyingText}>{flight.label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.atMintDeep,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  cardWin: { borderColor: "#E0A800", backgroundColor: colors.atCream },
  signColumn: { width: 32, alignItems: "center" },
  column: { width: 84, alignItems: "stretch", paddingBottom: 4, borderRadius: 12, borderWidth: 2, borderColor: "transparent" },
  focus: { borderColor: colors.atYellow, backgroundColor: "rgba(255,229,138,0.25)" },
  head: { textAlign: "center", fontFamily: fonts.bodyBold, fontSize: 14, color: colors.atInk, paddingVertical: 2, paddingHorizontal: 6 },
  carryCell: { height: 22, alignSelf: "center", minWidth: 24, alignItems: "center", justifyContent: "center" },
  carry: { fontFamily: fonts.headingBold, fontSize: 18, lineHeight: 22, textAlign: "center" },
  digit: { fontFamily: fonts.headingBold, fontSize: 32, lineHeight: 38, color: colors.atInk, textAlign: "center" },
  rule: { height: 3, marginHorizontal: 8, marginVertical: 2, borderRadius: 2, backgroundColor: colors.atInk, opacity: 0.7 },
  rewritten: { color: colors.atPurple },
  crossed: { textDecorationLine: "line-through", textDecorationColor: colors.atPurple, opacity: 0.5 },
  flying: { position: "absolute", left: 0, top: 0, height: 32, alignItems: "center", justifyContent: "center" },
  flyingChip: { minWidth: 32, height: 32, paddingHorizontal: 6, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.atYellow, borderWidth: 2, borderColor: colors.atPurple },
  flyingText: { fontFamily: fonts.headingBold, fontSize: 20, lineHeight: 24, color: colors.atPurple },
  ask: { color: colors.atTeal, opacity: 0.45 },
});
