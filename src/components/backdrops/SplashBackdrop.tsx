import type { ReactNode } from "react";
import { Image, StyleSheet, View, type ImageSourcePropType } from "react-native";

export const SPLASH_BACKGROUND = require("../../../assets/splash/bg-12.jpg");
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
