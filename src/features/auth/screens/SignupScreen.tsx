/**
 * Create An Account (mockup 04). New parent: Google (services/googleAuth → "Almost Done!") or
 * email/phone + password → services/auth creates the account and emails a code → Verify Account.
 * The password (≥ 8 characters) goes straight to Supabase and is never stored or logged.
 */

import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";

import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import ScreenHeading from "@/components/ui/ScreenHeading";
import ScreenShell from "@/components/ui/ScreenShell";
import { SPLASH_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import { ROUTES } from "@/constants/routes";
import { auth } from "@/services/auth";
import { actions } from "@/state/store";
import { colors, fonts } from "@/theme";

import CredentialFields from "../components/CredentialFields";
import GoogleSignIn from "../components/GoogleSignIn";
import { useCredentialsForm } from "../hooks/useCredentialsForm";
import { googleContinue } from "../utils/googleFlow";

const ENTER = FadeInDown.springify()
  .stiffness(260)
  .damping(24)
  .reduceMotion(ReduceMotion.System);

export default function SignupScreen() {
  const form = useCredentialsForm({
    submit: async (normalizedIdentifier, password) => {
      const result = await auth.signUp(normalizedIdentifier, password);
      if (!result.ok) return { identifier: result.message };
      actions.beginSignup(normalizedIdentifier);
      router.push(ROUTES.verify);
      return null;
    },
    google: () => googleContinue("signup"),
  });
  const {
    busy,
    errors,
    identifier,
    identifierRef,
    onGoogle,
    onIdentifierChange,
    onPasswordChange,
    onSubmit,
    password,
    passwordRef,
  } = form;

  return (
    <ScreenShell backgroundImage={SPLASH_BACKGROUND} back={ROUTES.welcome}>
      <Animated.View entering={ENTER} style={styles.enter}>
        <Panel>
          <ScreenHeading
            title="Create An Account"
            subtitle="Secure setup takes less than a minute!"
          />

          <GoogleSignIn busy={busy} onPress={onGoogle} />

          <CredentialFields
            identifierRef={identifierRef}
            passwordRef={passwordRef}
            identifier={identifier}
            password={password}
            errors={errors}
            onIdentifierChange={onIdentifierChange}
            onPasswordChange={onPasswordChange}
            onSubmit={onSubmit}
            passwordContentType="newPassword"
            passwordAutoComplete="new-password"
          />

          <Button
            trailing="arrow"
            loading={busy === "form"}
            disabled={busy === "google"}
            onPress={onSubmit}
            style={styles.submit}
          >
            Get Started
          </Button>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Have An Account? </Text>
            <Pressable
              onPress={() => router.push(ROUTES.login)}
              accessibilityRole="link"
              style={styles.footerLink}
            >
              {({ pressed }) => (
                <Text
                  style={[
                    styles.footerText,
                    styles.link,
                    pressed && styles.linkPressed,
                  ]}
                >
                  Login Now!
                </Text>
              )}
            </Pressable>
          </View>
        </Panel>
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  enter: { marginTop: 8 },
  submit: { marginTop: 28 },
  link: { color: colors.jgPurple },
  linkPressed: { color: "#6a3db8", textDecorationLine: "underline" },
  footer: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontFamily: fonts.headingBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.jgOutline,
    textAlign: "center",
  },
  footerLink: { paddingVertical: 12, marginVertical: -6, paddingHorizontal: 2 },
});
