/**
 * Log In To Account (mockup 03). Returning parent: Google (services/googleAuth) or email/phone + password.
 * The password goes to services/auth (Supabase when configured, else the offline prototype) and is never
 * stored or logged. Log In → auth.logIn → actions.login(identifier) → "Who is playing today?".
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
import PasswordUpdatedNote from "../components/PasswordUpdatedNote";
import { useCredentialsForm } from "../hooks/useCredentialsForm";
import { googleContinue } from "../utils/googleFlow";
import { usePasswordUpdatedNote } from "../hooks/usePasswordUpdatedNote";

const ENTER = FadeInDown.springify()
  .stiffness(260)
  .damping(24)
  .reduceMotion(ReduceMotion.System);

export default function LoginScreen() {
  const passwordUpdated = usePasswordUpdatedNote();
  const form = useCredentialsForm({
    submit: async (normalizedIdentifier, password) => {
      const result = await auth.logIn(normalizedIdentifier, password);
      if (!result.ok) return { password: result.message };
      actions.login(normalizedIdentifier);
      router.push(ROUTES.profiles);
      return null;
    },
    google: () => googleContinue("login"),
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
            title="Log In To Account"
            subtitle={"Hello Parent👋 Happy to have you back!"}
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
            passwordContentType="password"
            passwordAutoComplete="current-password"
          />

          <Pressable
            onPress={() => router.push(ROUTES.forgotPassword)}
            accessibilityRole="link"
            hitSlop={4}
            style={styles.forgot}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.link,
                  styles.forgotText,
                  pressed && styles.linkPressed,
                ]}
              >
                Forgot Your Password?
              </Text>
            )}
          </Pressable>

          <Button
            trailing="arrow"
            loading={busy === "form"}
            disabled={busy === "google"}
            onPress={onSubmit}
            style={styles.submit}
          >
            Log In
          </Button>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don’t Have An Account? </Text>
            <Pressable
              onPress={() => router.push(ROUTES.signup)}
              accessibilityRole="link"
              style={styles.footerLink}
            >
              {({ pressed }) => (
                <Text
                  style={[
                    styles.link,
                    styles.footerText,
                    pressed && styles.linkPressed,
                  ]}
                >
                  Register Now!
                </Text>
              )}
            </Pressable>
          </View>
        </Panel>
      </Animated.View>

      {passwordUpdated ? <PasswordUpdatedNote /> : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  enter: { marginTop: 8 },
  forgot: {
    marginTop: 4,
    minHeight: 48,
    justifyContent: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 2,
  },
  forgotText: { fontSize: 18, fontFamily: fonts.headingSemiBold },
  link: { color: colors.jgPurple },
  linkPressed: { color: "#6a3db8", textDecorationLine: "underline" },
  submit: { marginTop: 16 },
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
