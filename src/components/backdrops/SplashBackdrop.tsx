/**
 * SplashBackdrop — the splash's frame-12 jungle (bg-splash-12: sky, clouds, canopy, vines, grass) as a full-screen
 * background image, shared by /welcome and the login / sign-up screens. Pass `SPLASH_BACKGROUND` to
 * ScreenShell's `backgroundImage`; render `<SplashBackdrop />` on its own for a loading placeholder.
 */

import type { ReactNode } from "react";
import { Image, StyleSheet, View, type ImageSourcePropType } from "react-native";

export const SPLASH_BACKGROUND = require("../../../assets/splash/bg-12.jpg");
/** The home screen's meadow (New bg.svg, rasterised at 2× to 1536×2752): a clear lane down the middle for the trail. */
export const HOME_BACKGROUND = require("../../../assets/splash/home-bg.jpg");

export default function SplashBackdrop({
  children,
  source = SPLASH_BACKGROUND,
}: Readonly<{
  children?: ReactNode;
  source?: ImageSourcePropType;
}>) {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Explicit 100% size: with only absoluteFill the image can render at its intrinsic pixel size (zoomed in) */}
      <Image
        source={source}
        resizeMode="cover"
        blurRadius={source === HOME_BACKGROUND ? 2 : 0}
        style={styles.image}
      />
      {source === HOME_BACKGROUND ? <View pointerEvents="none" style={styles.homeMute} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { ...StyleSheet.absoluteFill, width: "100%", height: "100%" },
  homeMute: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(255,248,224,0.4)" },
});
