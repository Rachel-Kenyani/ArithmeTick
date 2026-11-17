import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text } from "react-native";

import { GROWN_UP } from "@/components/ui/GrownUpNote";
import { SettingsGroup, SettingsRow } from "@/components/ui/SettingsList";
import { MailIcon } from "@/components/ui/icons";
import { reports } from "@/services/reports";
import { actions } from "@/state/store";
import type { Account, ChildProfile } from "@/types/models";
import { colors, fonts } from "@/theme";

/**
 * The weekly email reports switch. Off until a grown-up turns it on; the note under it says what is kept on the
 * server, so turning it on is informed consent. Turning it off deletes what was kept.
 */
export default function ReportsGroup({ account, family }: Readonly<{ account: Account; family: readonly ChildProfile[] }>) {
  const on = account.reports === true;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void reports.isOn().then((serverOn) => {
      if (serverOn !== null) actions.setReports(serverOn);
    });
  }, []);

  const toggle = (next: boolean) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    void (next ? reports.turnOn(family) : reports.turnOff()).then((result) => {
      setBusy(false);
      if (result.ok) actions.setReports(next);
      else setError(result.message);
    });
  };

  return (
    <>
      <SettingsGroup
        title="Email reports"
        note={
          on
            ? "Every Sunday evening, and when a child finishes a grade. Turning this off deletes what we keep for reports."
            : "A Sunday email with each child's levels, stars, skills and a game to try at home. To send it, we keep their first names, grades, levels, stars and skills on our server."
        }
      >
        <SettingsRow
          label="Weekly reports"
          icon={<MailIcon size={22} strokeWidth={2.2} color={GROWN_UP.ink} />}
          trailing={
            <Switch
              value={on}
              disabled={busy}
              onValueChange={toggle}
              accessibilityLabel="Weekly email reports"
              trackColor={{ false: colors.locked, true: GROWN_UP.border }}
              thumbColor={on ? GROWN_UP.ink : colors.white}
              // @ts-expect-error activeThumbColor is the web build's name for the "on" thumb colour.
              activeThumbColor={GROWN_UP.ink}
              ios_backgroundColor={colors.locked}
            />
          }
        />
      </SettingsGroup>
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  error: { fontFamily: fonts.textBold, fontSize: 15, lineHeight: 20, color: GROWN_UP.ink, paddingHorizontal: 6 },
});
