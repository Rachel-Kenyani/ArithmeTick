import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";

import { GROWN_UP } from "@/components/ui/GrownUpNote";
import HoldToConfirm from "@/components/ui/HoldToConfirm";
import Panel from "@/components/ui/Panel";
import { StarIcon } from "@/components/ui/icons";
import { reports } from "@/services/reports";
import { actions } from "@/state/store";
import type { Account, ChildProfile } from "@/types/models";
import { colors, fonts } from "@/theme";

function namesOf(children: readonly ChildProfile[]): string {
  const names = children.map((c) => c.name);
  if (names.length === 0) return "your children";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/**
 * Weekly email reports, off until a grown-up turns them on. Before they do, it says exactly what will be kept on the
 * server, so turning them on is informed consent. Turning them off deletes it.
 */
export default function ReportsCard({ account, family }: Readonly<{ account: Account; family: readonly ChildProfile[] }>) {
  const on = account.reports === true;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const names = namesOf(family);

  useEffect(() => {
    void reports.isOn().then((serverOn) => {
      if (serverOn !== null) actions.setReports(serverOn);
    });
  }, []);

  const toggle = () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    void (on ? reports.turnOff() : reports.turnOn(family)).then((result) => {
      setBusy(false);
      if (result.ok) actions.setReports(!on);
      else setError(result.message);
    });
  };

  return (
    <Panel style={styles.panel}>
      <Text style={styles.title}>Weekly email reports</Text>
      <Text style={styles.body}>
        {on
          ? `Every Sunday evening, ${account.identifier} gets an email about how ${names} did that week, and another when they finish a grade.`
          : `Get an email every Sunday about how ${names} did that week: levels, stars, what they’re strong at, and one game to try at home.`}
      </Text>
      {on ? null : (
        <Text style={styles.small}>
          To send it, we keep each child’s first name, grade, levels finished, stars and skills on our server. Turning reports off
          deletes it.
        </Text>
      )}
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      {busy ? (
        <ActivityIndicator color={GROWN_UP.ink} accessibilityLabel={on ? "Turning reports off" : "Turning reports on"} />
      ) : (
        <HoldToConfirm
          label={on ? "Reports are on" : "Turn on weekly reports"}
          hint={on ? "Hold to turn them off and delete what we keep." : "Hold to agree and turn them on."}
          icon={<StarIcon size={20} strokeWidth={2.2} color={colors.atPlum} />}
          onConfirm={toggle}
        />
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 12 },
  title: { fontFamily: fonts.textBold, fontSize: 18, color: GROWN_UP.ink },
  body: { fontFamily: fonts.textSemiBold, fontSize: 16, lineHeight: 22, color: GROWN_UP.ink },
  small: { fontFamily: fonts.textSemiBold, fontSize: 14, lineHeight: 19, color: colors.muted },
  error: { fontFamily: fonts.textBold, fontSize: 15, lineHeight: 20, color: GROWN_UP.ink },
});
