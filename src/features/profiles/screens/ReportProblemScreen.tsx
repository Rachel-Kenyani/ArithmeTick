import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { SPLASH_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import Button from "@/components/ui/Button";
import { GROWN_UP } from "@/components/ui/GrownUpNote";
import Panel from "@/components/ui/Panel";
import ScreenHeading from "@/components/ui/ScreenHeading";
import ScreenShell from "@/components/ui/ScreenShell";
import { FieldMessage } from "@/components/ui/TextField";
import { fieldStyles, PLACEHOLDER_COLOR } from "@/components/ui/field/fieldStyles";
import { ROUTES } from "@/constants/routes";
import { useGuard } from "@/hooks/useGuard";
import { sfx } from "@/services/audio";
import { MESSAGE_MAX, REPORT_KINDS, reportProblem, sendProblemReport, type ReportKind } from "@/services/problemReports";
import { useAppState } from "@/state/store";
import { colors, fonts } from "@/theme";
import type { Grade } from "@/types/domain";

function Chip({ label, on, onPress }: Readonly<{ label: string; on: boolean; onPress: () => void }>) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: on }}
      onPress={() => {
        sfx.click();
        onPress();
      }}
      hitSlop={4}
      style={({ pressed }) => [styles.chip, on && styles.chipOn, pressed && styles.pressed]}
    >
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

/**
 * A grown-up tells us something didn't work, was hard to use, or could be better. Reached from the Grown-ups page,
 * behind the gear's hold. Saved to our report list with the app version; nothing about the child is sent.
 */
export default function ReportProblemScreen() {
  const ready = useGuard("account");
  const { profiles } = useAppState();
  const [kind, setKind] = useState<ReportKind | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ kind: string | null; message: string | null }>({ kind: null, message: null });
  const [sendError, setSendError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  if (!ready) return null;

  const grades = [...new Set(profiles.map((p) => p.grade))].sort();

  const send = () => {
    if (busy) return;
    const problems = reportProblem({ kind: kind ?? undefined, message });
    setErrors(problems);
    setSendError(null);
    if (problems.kind || problems.message || !kind) return;
    setBusy(true);
    void sendProblemReport({ kind, message, grade }).then((result) => {
      setBusy(false);
      if (result.ok) setSent(true);
      else setSendError(result.message);
    });
  };

  if (sent) {
    return (
      <ScreenShell backgroundImage={SPLASH_BACKGROUND} back={ROUTES.account}>
        <Panel style={styles.panel}>
          <ScreenHeading title="Thank You!" subtitle="We read every report, and it helps us make ArithmeTick work for more children." />
          <Button onPress={() => router.replace(ROUTES.account as never)}>Back to Grown-ups</Button>
        </Panel>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell backgroundImage={SPLASH_BACKGROUND} back={ROUTES.account}>
      <Panel style={styles.panel}>
        <ScreenHeading title="Report a Problem" subtitle="Tell us what went wrong or what was hard. We read every report." />

        <View style={styles.block}>
          <Text style={styles.label}>What kind?</Text>
          <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="What kind of report">
            {REPORT_KINDS.map((k) => (
              <Chip key={k.id} label={k.label} on={kind === k.id} onPress={() => setKind(k.id)} />
            ))}
          </View>
          <FieldMessage error={errors.kind} />
        </View>

        {grades.length ? (
          <View style={styles.block}>
            <Text style={styles.label}>Which grade? (optional)</Text>
            <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="Which grade, optional">
              {grades.map((g) => (
                <Chip key={g} label={`Grade ${g}`} on={grade === g} onPress={() => setGrade(grade === g ? null : g)} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.block}>
          <Text style={styles.label}>What happened?</Text>
          <View style={[fieldStyles.face, styles.box, focused && fieldStyles.focused, errors.message ? fieldStyles.error : null]}>
            <TextInput
              accessibilityLabel="What happened"
              placeholder="For example: on Grade 2 Level 7, my son couldn't drag the seeds."
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={MESSAGE_MAX}
              textAlignVertical="top"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={[fieldStyles.text, styles.input]}
            />
          </View>
          <FieldMessage error={errors.message} hint="Please don’t include passwords or a child’s full name." />
        </View>

        {sendError ? (
          <Text style={styles.sendError} accessibilityRole="alert" selectable>
            {sendError}
          </Text>
        ) : null}

        <Button loading={busy} onPress={send}>
          Send Report
        </Button>
      </Panel>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 20 },
  block: { gap: 10 },
  label: { fontFamily: fonts.textBold, fontSize: 17, color: GROWN_UP.ink },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: GROWN_UP.border,
    backgroundColor: colors.white,
    justifyContent: "center",
  },
  chipOn: { backgroundColor: GROWN_UP.ink, borderColor: GROWN_UP.ink },
  pressed: { opacity: 0.7 },
  chipText: { fontFamily: fonts.textBold, fontSize: 15, color: GROWN_UP.ink },
  chipTextOn: { color: colors.white },
  box: { alignItems: "flex-start", paddingVertical: 12 },
  input: { flex: 1, minHeight: 120 },
  sendError: { fontFamily: fonts.textBold, fontSize: 15, lineHeight: 21, color: GROWN_UP.ink },
});
