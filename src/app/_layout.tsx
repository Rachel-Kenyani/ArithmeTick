import { DynaPuff_600SemiBold, DynaPuff_700Bold } from "@expo-google-fonts/dynapuff";
import { Quicksand_600SemiBold, Quicksand_700Bold } from "@expo-google-fonts/quicksand";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ReduceMotion, ReducedMotionConfig } from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import CaptchaHost from "@/components/ui/CaptchaHost";
import { useCalm } from "@/hooks/useCalm";
import { useApplySoundSettings } from "@/hooks/useSoundSettings";
import { startFamilySync } from "@/services/familySync";
import { whenBackdropPainted } from "@/services/splashGate";
import { whenHydrated } from "@/state/store";
import { colors } from "@/theme";

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DynaPuff_600SemiBold,
    DynaPuff_700Bold,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });
  const [stateLoaded, setStateLoaded] = useState(false);
  useApplySoundSettings();
  const calm = useCalm();

  useEffect(() => {
    void whenHydrated().then(() => setStateLoaded(true));
  }, []);

  const ready = (fontsLoaded || fontError !== null) && stateLoaded;

  useEffect(() => {
    if (!ready) return;
    void whenBackdropPainted().then(() => SplashScreen.hideAsync().catch(() => {}));
  }, [ready]);

  useEffect(() => (stateLoaded ? startFamilySync() : undefined), [stateLoaded]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {calm ? <ReducedMotionConfig mode={ReduceMotion.Always} /> : null}
        <Stack screenOptions={{ headerShown: false, animation: "fade", contentStyle: { backgroundColor: colors.jgSky } }}>
          <Stack.Screen name="splash" options={{ animation: "none", gestureEnabled: false }} />
          <Stack.Screen name="index" options={{ animation: "none" }} />
        </Stack>
        <CaptchaHost />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
