import { useMemo } from "react";
import { Image, StyleSheet, View, useWindowDimensions } from "react-native";

import { paintCounter } from "@/services/splashGate";

const SKY = require("../../../assets/splash/splash-sky.jpg");
const TOP = require("../../../assets/splash/splash-top.png");
const BOTTOM = require("../../../assets/splash/splash-bottom.png");

/** The exported layers' size in pixels, 1440 wide so they stay light on budget phones. */
const ART_W = 1440;
const TOP_H = 773;
const BOTTOM_H = 527;
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
  const onLoad = useMemo(() => paintCounter(1 + Number(showTop) + Number(showBottom)), [showTop, showBottom]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image source={SKY} resizeMode="cover" style={styles.fill} onLoad={onLoad} />
      {showTop ? <Image source={TOP} onLoad={onLoad} style={[styles.layer, { top: 0, width: W, height: TOP_H * scale }]} /> : null}
      {showBottom ? (
        <Image source={BOTTOM} onLoad={onLoad} style={[styles.layer, { bottom: 0, width: W, height: BOTTOM_H * scale }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill, width: "100%", height: "100%" },
  layer: { position: "absolute", left: 0 },
});
