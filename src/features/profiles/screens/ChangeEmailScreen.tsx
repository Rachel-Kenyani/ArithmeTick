import { Redirect, router } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, View, type TextInputInstance } from "react-native";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";

import { SPLASH_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import Button from "@/components/ui/Button";
import OtpInput from "@/components/ui/OtpInput";
import Panel from "@/components/ui/Panel";
import ScreenHeading from "@/components/ui/ScreenHeading";
import ScreenShell from "@/components/ui/ScreenShell";
import { FieldMessage, PasswordField, TextField } from "@/components/ui/TextField";
import { KeyIcon, MailIcon } from "@/components/ui/icons";
import { ROUTES } from "@/constants/routes";
import { canChangeEmail, maskIdentifier, newEmailProblem } from "@/features/auth/utils/validate";
import { CODE_LENGTH } from "@/features/auth/utils/verifyFlow";
import { useGuard } from "@/hooks/useGuard";
import { auth } from "@/services/auth";
import { actions, useAppState } from "@/state/store";
import { colors } from "@/theme";

const ENTER = FadeInDown.springify().stiffness(260).damping(24).reduceMotion(ReduceMotion.System);

export default function ChangeEmailScreen() {
  const ready = useGuard("account");
  const { account } = useAppState();
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (!ready || !account) return null;
  if (!canChangeEmail(account)) return <Redirect href={ROUTES.account as never} />;

  return (
    <ScreenShell backgroundImage={SPLASH_BACKGROUND} back={ROUTES.account}>
      <Animated.View entering={ENTER} key={sentTo ?? "form"}>
        <Panel>
          {sentTo ? (
            <CodeStep newEmail={sentTo} />
          ) : (
            <FormStep currentEmail={account.identifier} onSent={setSentTo} />
          )}
        </Panel>
      </Animated.View>
    </ScreenShell>
  );
}

function FormStep({ currentEmail, onSent }: Readonly<{ currentEmail: string; onSent: (email: string) => void }>) {
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [errors, setErrors] = useState<{ password: string | null; email: string | null }>({ password: null, email: null });
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef<TextInputInstance>(null);
  const emailRef = useRef<TextInputInstance>(null);

  const onSubmit = () => {
    if (busy) return;
    const next = {
      email: newEmailProblem(currentEmail, newEmail),
      password: password ? null : "Please enter your current password.",
    };
    setErrors(next);
    if (next.email) return emailRef.current?.focus();
    if (next.password) return passwordRef.current?.focus();
    setBusy(true);
    const normalized = newEmail.trim().toLowerCase();
    void auth.requestEmailChange(currentEmail, password, normalized).then((result) => {
      setBusy(false);
      if (result.ok) return onSent(normalized);
      if (/password/i.test(result.message)) setErrors({ password: result.message, email: null });
      else setErrors({ password: null, email: result.message });
    });
  };

  return (
    <>
      <ScreenHeading title="Change Email" subtitle={`You log in with ${currentEmail} now.`} />
      <View style={styles.fields}>
        <TextField
          ref={emailRef}
          label="New email"
          icon={<MailIcon color={colors.atPurple} />}
          placeholder="Enter your New Email"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          value={newEmail}
          onChangeText={setNewEmail}
          error={errors.email}
        />
        <PasswordField
          ref={passwordRef}
          label="Current password"
          icon={<KeyIcon color={colors.atPurple} />}
          placeholder="Enter Password"
          textContentType="password"
          autoComplete="current-password"
          returnKeyType="send"
          onSubmitEditing={onSubmit}
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />
      </View>
      <Button trailing="arrow" loading={busy} onPress={onSubmit} style={styles.submit}>
        Send a Code
      </Button>
    </>
  );
}

function CodeStep({ newEmail }: Readonly<{ newEmail: string }>) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const confirm = (value: string) => {
    if (busy || value.length < CODE_LENGTH) return;
    setBusy(true);
    setError(null);
    void auth.confirmEmailChange(newEmail, value).then((result) => {
      if (!result.ok) {
        setError(result.message);
        setBusy(false);
        return;
      }
      actions.changeEmail(newEmail);
      router.replace(ROUTES.account as never);
    });
  };

  return (
    <>
      <ScreenHeading
        title="Check Your Email"
        subtitle={
          <>
            Enter the <Text style={styles.purple}>{CODE_LENGTH}-digit code</Text> sent to{" "}
            <Text style={styles.purple}>{maskIdentifier(newEmail)}</Text>
          </>
        }
      />
      <OtpInput
        length={CODE_LENGTH}
        value={code}
        onChange={(next) => {
          setCode(next);
          if (error) setError(null);
        }}
        onComplete={confirm}
        label={`${CODE_LENGTH}-digit code`}
        autoFocus
        invalid={Boolean(error)}
        style={styles.fields}
      />
      <FieldMessage error={error} />
      <Button trailing="arrow" loading={busy} onPress={() => confirm(code)} style={styles.submit}>
        Change Email
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  fields: { marginTop: 24, gap: 14 },
  submit: { marginTop: 28 },
  purple: { color: colors.atPurple },
});
