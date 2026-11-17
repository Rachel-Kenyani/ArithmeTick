import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  ReduceMotion,
} from "react-native-reanimated";

import { GROWN_UP } from "@/components/ui/GrownUpNote";
import HoldToConfirm from "@/components/ui/HoldToConfirm";
import { HandIcon, SettingsIcon } from "@/components/ui/icons";
import { ROUTES } from "@/constants/routes";
import { colors, fonts } from "@/theme";

const TIP_MS = 2600;

/**
 * The way into the grown-ups' settings: a plum gear labelled "Hold". Letting go too soon shows a tip saying to keep
 * holding, so a grown-up who taps it learns what to do, and a child who taps it gets nowhere.
 */
export default function GrownUpsGear() {
  const [tip, setTip] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const showTip = () => {
    setTip(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setTip(false), TIP_MS);
  };

  return (
    <View style={styles.wrap}>
      <HoldToConfirm
        compact
        label="Grown-ups: hold for 2 seconds to add a child, change settings or log out"
        icon={
          <SettingsIcon size={24} strokeWidth={2.2} color={colors.atPlum} />
        }
        onEarlyRelease={showTip}
        onConfirm={() => {
          setTip(false);
          router.push(ROUTES.account as never);
        }}
      />
      {tip ? (
        <Animated.View
          entering={FadeIn.duration(150).reduceMotion(ReduceMotion.System)}
          exiting={FadeOut.duration(200).reduceMotion(ReduceMotion.System)}
          style={styles.tip}
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.tipText}>
            Grown-ups: hold the gear for 2 seconds to open settings.
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 4 },
  tip: {
    position: "absolute",
    top: 6,
    right: 62,
    width: 190,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: GROWN_UP.border,
  },
  tipText: {
    fontFamily: fonts.textBold,
    fontSize: 14,
    lineHeight: 19,
    color: GROWN_UP.ink,
  },
});
