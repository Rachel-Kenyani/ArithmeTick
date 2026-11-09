import { DynaPuff_400Regular, DynaPuff_500Medium, DynaPuff_600SemiBold, DynaPuff_700Bold } from "@expo-google-fonts/dynapuff";
import { Quicksand_400Regular, Quicksand_500Medium, Quicksand_600SemiBold, Quicksand_700Bold } from "@expo-google-fonts/quicksand";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useApplySoundSettings } from "@/hooks/useSoundSettings";
import { whenHydrated } from "@/state/store";
import { colors } from "@/theme";

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DynaPuff_400Regular,
    DynaPuff_500Medium,
    DynaPuff_600SemiBold,
    DynaPuff_700Bold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });
  const [stateLoaded, setStateLoaded] = useState(false);
  useApplySoundSettings();

  useEffect(() => {
    void whenHydrated().then(() => setStateLoaded(true));
  }, []);

  const ready = (fontsLoaded || fontError !== null) && stateLoaded;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: "fade", contentStyle: { backgroundColor: colors.jgSky } }}>
          <Stack.Screen name="splash" options={{ animation: "none", gestureEnabled: false }} />
          <Stack.Screen name="index" options={{ animation: "none" }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
