import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";

import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import ScreenHeading from "@/components/ui/ScreenHeading";
import ScreenShell from "@/components/ui/ScreenShell";
import { SPLASH_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import { ChevronRightIcon, KeyIcon, RouteIcon } from "@/components/ui/icons";
import { sfx } from "@/services/audio";
import { ROUTES } from "@/constants/routes";
import { useAppState } from "@/state/store";
import { colors, fonts } from "@/theme";

import BrijoHead from "../components/BrijoHead";
import SlideUp from "../components/SlideUp";

const clamp = (min: number, v: number, max: number) => Math.min(max, Math.max(min, v));

export default function WelcomeScreen() {
  const account = useAppState().account;
  const { width: W, height: H } = useWindowDimensions();
  const head = clamp(140, W * 0.37, 200);

  return (
    <ScreenShell backgroundImage={SPLASH_BACKGROUND} gap={clamp(16, H * 0.03, 28)} style={{ paddingTop: clamp(0, H * 0.1 - 40, 56) }}>
      <BrijoHead size={head} />

      <SlideUp>
        <Panel>
          <ScreenHeading
            title={"Hey, Explorer! Get a Grown-up"}
            subtitle="Help your little explorer start their learning journey."
          />

          <View style={styles.doors}>
            <Button
              variant="teal"
              icon={<RouteIcon color={colors.white} />}
              trailing="chevron"
              onPress={() => router.push(ROUTES.signup as never)}
            >
              I’m New Here!
            </Button>
            <Button
              variant="purple"
              icon={<KeyIcon color={colors.white} />}
              trailing="chevron"
              onPress={() => router.push(ROUTES.login as never)}
            >
              Back? Log In
            </Button>
          </View>

          {account ? (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Continue as ${account.identifier}`}
              onPress={() => {
                sfx.click();
                router.push(ROUTES.profiles as never);
              }}
              style={({ pressed }) => [styles.continue, pressed && { opacity: 0.75 }]}
            >
              <Text style={[styles.continueText, { color: colors.jgOutline, flexShrink: 0 }]}>Continue as</Text>
              <Text style={[styles.continueText, { color: colors.jgPurple, flexShrink: 1 }]} numberOfLines={1}>
                {account.identifier}
              </Text>
              <ChevronRightIcon size={20} strokeWidth={2.4} color={colors.jgPurple} />
            </Pressable>
          ) : null}
        </Panel>
      </SlideUp>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  doors: { marginTop: 32, gap: 24 },
  continue: {
    marginTop: 16,
    minHeight: 48,
    maxWidth: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  continueText: { fontFamily: fonts.headingBold, fontSize: 18 },
});
