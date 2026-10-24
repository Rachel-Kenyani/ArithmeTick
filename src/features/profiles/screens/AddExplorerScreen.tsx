/**
 * "Almost Done!" — add a child profile (docs/APP-SHELL.md §2/§5, mockup 06).
 *
 * Parent-facing form on the mint card: the Explorer's name (with a live preview of the avatar the child
 * will get, popping in as soon as a name is typed), the grade select, and an optional 6-character school
 * invite code. "Let's Play →" → actions.addProfile → /profiles. Messages are friendly and only appear
 * after a submit attempt. The back button only exists when the family already has children.
 * A family has at most MAX_PROFILES children: arriving here with a full family goes back to /profiles.
 */

import { StyleSheet } from "react-native";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";

import Button from "@/components/ui/Button";
import { GradCapIcon, SmileIcon } from "@/components/ui/icons";
import Panel from "@/components/ui/Panel";
import ScreenHeading from "@/components/ui/ScreenHeading";
import ScreenShell from "@/components/ui/ScreenShell";
import SplashBackdrop, { SPLASH_BACKGROUND } from "@/components/backdrops/SplashBackdrop";
import SelectField from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { ROUTES } from "@/constants/routes";
import { useAppState } from "@/state/store";
import { useGuard } from "@/hooks/useGuard";
import { colors } from "@/theme";

import AvatarPreview from "../components/AvatarPreview";
import SchoolCodeBlock from "../components/SchoolCodeBlock";
import { CODE_LENGTH, GRADE_OPTIONS, NAME_MAX, useAddExplorerForm } from "../hooks/useAddExplorerForm";

const ENTER = FadeIn.springify().stiffness(320).damping(28).reduceMotion(ReduceMotion.System);

export default function AddExplorerScreen() {
  const ready = useGuard("account");
  const { profiles } = useAppState();
  const {
    avatar, busy, code, codeReady, codeRef, errors, grade, hasName, name, nameRef, onCodeChange, onGradeChange, onNameChange, onNameSubmit, showBack, submit,
  } = useAddExplorerForm(ready, profiles);

  if (!ready) return <SplashBackdrop />;

  return (
    <ScreenShell backgroundImage={SPLASH_BACKGROUND} back={showBack ? ROUTES.profiles : undefined}>
      <Animated.View entering={ENTER}>
        <Panel>
          <ScreenHeading title="Almost Done!" style={styles.heading} />

          <TextField
            ref={nameRef}
            label="What's your Explorer's name?"
            placeholder="What's your Explorer's name?"
            icon={<SmileIcon color={colors.atPurple} />}
            value={name}
            onChangeText={onNameChange}
            returnKeyType="next"
            onSubmitEditing={onNameSubmit}
            error={errors.name}
            maxLength={NAME_MAX}
            autoComplete="off"
            textContentType="none"
            autoCapitalize="words"
            autoCorrect={false}
            spellCheck={false}
            trailing={hasName ? <AvatarPreview avatar={avatar} /> : null}
          />

          <SelectField
            label="Choose their Grade / Class"
            placeholder="Choose their Grade / Class"
            icon={<GradCapIcon color={colors.atPurple} />}
            value={grade}
            options={GRADE_OPTIONS}
            onChange={onGradeChange}
            error={errors.grade}
            style={styles.grade}
          />

          <SchoolCodeBlock
            codeRef={codeRef}
            length={CODE_LENGTH}
            code={code}
            error={errors.code}
            codeReady={codeReady}
            onChange={onCodeChange}
          />

          <Button trailing="arrow" loading={busy} onPress={submit} style={styles.submit}>
            Let&apos;s Play
          </Button>
        </Panel>
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: 24 },
  grade: { marginTop: 16 },
  submit: { marginTop: 28 },
});
