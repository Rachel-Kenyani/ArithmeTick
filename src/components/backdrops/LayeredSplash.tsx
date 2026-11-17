import { Image, StyleSheet, View, useWindowDimensions } from "react-native";

const SKY = require("../../../assets/splash/splash-sky.jpg");
const TOP = require("../../../assets/splash/splash-top.png");
const BOTTOM = require("../../../assets/splash/splash-bottom.png");

const ART_W = 2048;
const TOP_H = 1100;
const BOTTOM_H = 750;
/** The most of the screen height the leaves and the grass may take, so the middle stays open sky. */
const TOP_SHARE = 0.4;
const BOTTOM_SHARE = 0.28;

/**
 * The sign-in jungle built from three exported layers, so it fits any screen: the sky fills the screen, the leaves and
 * clouds hang from the top and the grass runs along the bottom, each spanning the width. A layer is left out when, at
 * full width, it would take more than its share of the height (wide landscape screens), because cropping or shrinking
 * it leaves hard edges. Landscape needs its own wider exports.
 */
export default function LayeredSplash() {
  const { width: W, height: H } = useWindowDimensions();
  const scale = W / ART_W;
  const showTop = TOP_H * scale <= H * TOP_SHARE;
  const showBottom = BOTTOM_H * scale <= H * BOTTOM_SHARE;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image source={SKY} resizeMode="cover" style={styles.fill} />
      {showTop ? <Image source={TOP} style={[styles.layer, { top: 0, width: W, height: TOP_H * scale }]} /> : null}
      {showBottom ? (
        <Image source={BOTTOM} style={[styles.layer, { bottom: 0, width: W, height: BOTTOM_H * scale }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill, width: "100%", height: "100%" },
  layer: { position: "absolute", left: 0 },
});
