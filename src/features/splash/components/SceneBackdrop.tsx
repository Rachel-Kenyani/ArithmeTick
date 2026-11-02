import { Image, StyleSheet } from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";
import type { ViewStyle } from "react-native";

import TrianglePattern from "./TrianglePattern";

const BG_10 = require("../../../../assets/splash/bg-10.jpg");
const BG_11 = require("../../../../assets/splash/bg-11.jpg");
const BG_12 = require("../../../../assets/splash/bg-12.jpg");

type Style = AnimatedStyle<ViewStyle>;

export default function SceneBackdrop({
  skyStyle,
  bg10Style,
  bg11Style,
  bg12Style,
}: Readonly<{
  skyStyle: Style;
  bg10Style: Style;
  bg11Style: Style;
  bg12Style: Style;
}>) {
  return (
    <>
      <TrianglePattern />
      <Animated.View style={[StyleSheet.absoluteFill, skyStyle]}>
        <TrianglePattern sky />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, bg10Style]}
      >
        <Image source={BG_10} style={styles.bg} resizeMode="cover" />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, bg11Style]}
      >
        <Image source={BG_11} style={styles.bg} resizeMode="cover" />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, bg12Style]}
      >
        <Image source={BG_12} style={styles.bg} resizeMode="cover" />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  bg: { width: "100%", height: "100%" },
});
