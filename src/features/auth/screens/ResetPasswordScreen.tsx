/**
 * Reset Password (mockup 10). Last step of Forgot → Verify Identity → here, or opened straight from the
 * "Reset password" link in the email (arithmetick://reset-password#…tokens). Needs a pending reset flow or a
 * valid link, otherwise → Forgot Password / Log In. The new password is only checked (≥ 8 characters, both entries match) —
 * it is never stored or logged. Save → actions.completeReset() → Log In, which shows a one-time
 * "Password updated" note (in-memory flag from @/lib/flash, no secrets).
 */

import * as Linking from "expo-linking";
import { router, useIsFocused } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, type TextInputInstance } from "react-native";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";

import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import ScreenHeading from "@/components/ui/ScreenHeading";
import ScreenShell from "@/components/ui/ScreenShell";
import SplashBackdrop, { SPLASH_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import { PasswordField } from "@/components/ui/TextField";
import { KeyIcon } from "@/components/ui/icons";
import { auth } from "@/services/auth";
import { markPasswordUpdated } from "@/services/flash";
import { ROUTES } from "@/constants/routes";
import { actions, useAppState, useHydrated } from "@/state/store";
import { confirmProblem, passwordProblem } from "@/utils/validate";
import { colors } from "@/theme";

interface Errors {
  password: string | null;
  confirm: string | null;
}

const NO_ERRORS: Errors = { password: null, confirm: null };

const ENTER = FadeInDown.springify().stiffness(260).damping(24).reduceMotion(ReduceMotion.System);

export default function ResetPasswordScreen() {
  const hydrated = useHydrated();
  const { pending } = useAppState();
  // completeReset() clears `pending` while we navigate to Log In — don't bounce meanwhile.
  const [saved, setSaved] = useState(false);
  const allowed = pending?.purpose === "reset" || saved;
  // Opened from the email's link: turn it into a reset session first.
  const url = Linking.useURL();
  const fromLink = !allowed && !!url?.includes("reset-password") && /access_token|error/.test(url);

  const focused = useIsFocused();
  useEffect(() => {
    if (!focused || !hydrated || allowed) return;
    if (!fromLink || !url) {
      router.replace(ROUTES.login);
      return;
    }
    void auth.openResetLink(url).then((result) => {
      if (result.ok) actions.beginReset(result.email);
      else router.replace(ROUTES.forgotPassword);
    });
  }, [focused, hydrated, allowed, fromLink, url]);

  if (!hydrated || !allowed) return <SplashBackdrop />;
  return <ResetCard onSaved={() => setSaved(true)} />;
}

function ResetCard({ onSaved }: Readonly<{ onSaved: () => void }>) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>(NO_ERRORS);
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  const onPasswordChange = (next: string) => {
    setPassword(next);
    // Reward early: notes clear as soon as they're fixed (new notes only appear on submit).
    setErrors((prev) => ({
      password: prev.password && !passwordProblem(next) ? null : prev.password,
      confirm: prev.confirm && confirm && !confirmProblem(next, confirm) ? null : prev.confirm,
    }));
  };

  const onConfirmChange = (next: string) => {
    setConfirm(next);
    if (errors.confirm && !confirmProblem(password, next)) setErrors((prev) => ({ ...prev, confirm: null }));
  };

  const onSubmit = () => {
    if (busy) return;
    const passwordIssue = passwordProblem(password);
    const next: Errors = { password: passwordIssue, confirm: passwordIssue ? null : confirmProblem(password, confirm) };
    setErrors(next);
    if (next.password) return passwordRef.current?.focus();
    if (next.confirm) return confirmRef.current?.focus();
    setBusy(true);
    void auth.setNewPassword(password).then((result) => {
      if (!result.ok) {
        setErrors({ password: result.message, confirm: null });
        setBusy(false);
        return;
      }
      markPasswordUpdated();
      onSaved();
      // Go to Log In first (replacing this screen), then clear the finished reset flow.
      router.replace(ROUTES.login);
      actions.completeReset();
    });
  };

  return (
    <ScreenShell backgroundImage={SPLASH_BACKGROUND}>
      <Animated.View entering={ENTER}>
        <Panel>
          <ScreenHeading title="Reset Password" subtitle="Create a strong password." />

          <View style={styles.fields}>
            <PasswordField
              ref={passwordRef}
              label="Password"
              icon={<KeyIcon color={colors.atPurple} />}
              placeholder="Enter Password"
              textContentType="newPassword"
              autoComplete="new-password"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => confirmRef.current?.focus()}
              value={password}
              onChangeText={onPasswordChange}
              error={errors.password}
            />
            <PasswordField
              ref={confirmRef}
              label="Confirm password"
              icon={<KeyIcon color={colors.atPurple} />}
              placeholder="Confirm Password"
              textContentType="newPassword"
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={onSubmit}
              value={confirm}
              onChangeText={onConfirmChange}
              error={errors.confirm}
            />
          </View>

          <Button trailing="arrow" loading={busy} onPress={onSubmit} style={styles.submit}>
            Save Password
          </Button>
        </Panel>
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  fields: { marginTop: 24, gap: 14 },
  submit: { marginTop: 28 },
});
