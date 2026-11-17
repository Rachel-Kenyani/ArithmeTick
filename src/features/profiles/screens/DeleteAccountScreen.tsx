import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";

import { SPLASH_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import { GROWN_UP } from "@/components/ui/GrownUpNote";
import HoldToConfirm from "@/components/ui/HoldToConfirm";
import Panel from "@/components/ui/Panel";
import ScreenHeading from "@/components/ui/ScreenHeading";
import ScreenShell from "@/components/ui/ScreenShell";
import { TrashIcon } from "@/components/ui/icons";
import { ROUTES } from "@/constants/routes";
import { useGuard } from "@/hooks/useGuard";
import { auth } from "@/services/auth";
import { signOutOfGoogle } from "@/services/googleAuth";
import { actions, useAppState } from "@/state/store";
import { colors, fonts } from "@/theme";

function whatIsLost(names: readonly string[]): string {
  if (names.length === 0) return "The account and its sign-in.";
  const who = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
  return `${who}: names, animals, stars, badges and progress in every grade.`;
}

/** The last step before deleting the account: says exactly what is lost, then a 2-second hold on the red button. */
export default function DeleteAccountScreen() {
  const ready = useGuard("account");
  const { account, profiles } = useAppState();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready || !account) return null;

  const remove = () => {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    void auth.deleteAccount().then((result) => {
      if (!result.ok) {
        setError(result.message);
        setDeleting(false);
        return;
      }
      void signOutOfGoogle();
      actions.deleteAccount();
      router.replace(ROUTES.welcome as never);
    });
  };

  return (
    <ScreenShell backgroundImage={SPLASH_BACKGROUND} back={ROUTES.account}>
      <Panel style={styles.panel}>
        <ScreenHeading title="Delete Account" subtitle={account.name ?? account.identifier} />
        <Text style={styles.label}>What will be deleted</Text>
        <Text style={styles.body}>{whatIsLost(profiles.map((p) => p.name))}</Text>
        <Text style={styles.body}>Any weekly report summaries we keep, and your sign-in.</Text>
        <Text style={styles.warning}>This can’t be undone. To play again, you would need to sign up again.</Text>
        {error ? (
          <Text style={styles.warning} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
        {deleting ? (
          <ActivityIndicator color={GROWN_UP.ink} accessibilityLabel="Deleting the account" />
        ) : (
          <HoldToConfirm
            tone="danger"
            label="Delete everything"
            hint="Hold for 2 seconds."
            icon={<TrashIcon size={20} strokeWidth={2.4} color={colors.white} />}
            onConfirm={remove}
          />
        )}
      </Panel>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 12 },
  label: { fontFamily: fonts.textBold, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: GROWN_UP.ink },
  body: { fontFamily: fonts.textSemiBold, fontSize: 16, lineHeight: 22, color: GROWN_UP.ink },
  warning: { fontFamily: fonts.textBold, fontSize: 16, lineHeight: 22, color: colors.danger },
});
