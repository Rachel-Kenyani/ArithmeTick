/**
 * Forgot Your Password? (mockup 08). The parent enters their email / phone, we "send" a code
 * (actions.beginReset) → Verify Identity → Reset Password. Nothing leaves the device.
 */

import { router } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, type TextInputInstance } from "react-native";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";

import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import ScreenHeading from "@/components/ui/ScreenHeading";
import ScreenShell from "@/components/ui/ScreenShell";
import { SPLASH_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import { TextField } from "@/components/ui/TextField";
import { MailIcon } from "@/components/ui/icons";
import { ROUTES } from "@/constants/routes";
import { actions } from "@/state/store";
import { identifierProblem, normalizeIdentifier } from "@/utils/validate";
import { colors } from "@/theme";

const ENTER = FadeInDown.springify().stiffness(260).damping(24).reduceMotion(ReduceMotion.System);

export default function ForgotPasswordScreen() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const identifierRef = useRef<TextInputInstance>(null);

  const onChange = (next: string) => {
    setIdentifier(next);
    // Reward early: clear the note as soon as it's fixed (a new note only appears on submit).
    if (error && !identifierProblem(next)) setError(null);
  };

  const onSubmit = () => {
    if (busy) return;
    const problem = identifierProblem(identifier);
    setError(problem);
    if (problem) return identifierRef.current?.focus();
    setBusy(true);
    actions.beginReset(normalizeIdentifier(identifier));
    router.push(ROUTES.verify);
  };

  return (
    <ScreenShell backgroundImage={SPLASH_BACKGROUND} back={ROUTES.login}>
      <Animated.View entering={ENTER} style={styles.enter}>
        <Panel>
          <ScreenHeading
            title="Forgot Your Password?"
            subtitle="Enter your registered email or phone number to receive a verification code."
          />

          <TextField
            ref={identifierRef}
            label="Email or phone number"
            icon={<MailIcon color={colors.atPurple} />}
            placeholder="Enter Email or Phone Number"
            keyboardType="email-address"
            textContentType="username"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            returnKeyType="send"
            onSubmitEditing={onSubmit}
            value={identifier}
            onChangeText={onChange}
            error={error}
            style={styles.field}
          />

          <Button trailing="arrow" loading={busy} onPress={onSubmit} style={styles.submit}>
            Request a Code
          </Button>
        </Panel>
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  enter: { marginTop: 8 },
  field: { marginTop: 24 },
  submit: { marginTop: 28 },
});
