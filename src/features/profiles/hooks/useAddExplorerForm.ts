/**
 * "Almost Done!" form state: name / grade / school code, friendly validation after a submit attempt,
 * actions.addProfile → /profiles, and the full-family redirect.
 */

import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Keyboard, type TextInputInstance } from "react-native";

import { sfx } from "@/services/audio";
import { AVATARS, MAX_PROFILES, type AvatarKind, type ChildProfile } from "@/types/models";
import { ROUTES } from "@/constants/routes";
import { actions } from "@/state/store";
import { GRADE_META, type Grade } from "@/types/domain";

export const NAME_MAX = 20;
export const CODE_LENGTH = 6;
const GRADES: readonly Grade[] = [1, 2, 3];
export const GRADE_OPTIONS = GRADES.map((g) => ({ value: String(g), label: `${GRADE_META[g].shortLabel} · ${GRADE_META[g].mechanic}` }));

interface FormErrors {
  name: string | null;
  grade: string | null;
  code: string | null;
}

const NO_ERRORS: FormErrors = { name: null, grade: null, code: null };

/** The avatar addProfile() will assign — the same rule as the store: first unused, else cycle. */
function nextAvatar(profiles: readonly ChildProfile[]): AvatarKind {
  const used = new Set(profiles.map((p) => p.avatar));
  return AVATARS.find((a) => !used.has(a)) ?? AVATARS[profiles.length % AVATARS.length];
}

export function useAddExplorerForm(ready: boolean, profiles: readonly ChildProfile[]) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<FormErrors>(NO_ERRORS);
  const [busy, setBusy] = useState(false);
  /** Children count frozen at submit, so the back button doesn't pop in while we navigate away. */
  const [frozenCount, setFrozenCount] = useState<number | null>(null);

  const nameRef = useRef<TextInputInstance>(null);
  const codeRef = useRef<TextInputInstance>(null);

  // Full family (e.g. a stale deep link): nothing to add here. Not after our own submit, which navigates itself.
  const full = frozenCount === null && profiles.length >= MAX_PROFILES;
  useEffect(() => {
    if (ready && full) router.replace(ROUTES.profiles);
  }, [ready, full]);

  const showBack = (frozenCount ?? profiles.length) > 0;
  const avatar = nextAvatar(profiles);
  const hasName = name.trim().length > 0;
  const codeReady = code.length === CODE_LENGTH;

  const submit = () => {
    if (busy) return;
    const trimmed = name.trim();
    const chosenGrade = GRADES.find((g) => String(g) === grade) ?? null;
    const next: FormErrors = {
      name: trimmed ? null : "Add your Explorer's name to continue",
      grade: chosenGrade ? null : "Choose a grade so we pick the right games",
      code: code.length === 0 || codeReady ? null : "Enter all 6 characters or leave it empty",
    };
    setErrors(next);
    if (next.name) {
      nameRef.current?.focus();
      return;
    }
    if (!chosenGrade) {
      // The grade sheet isn't a focusable field: drop the keyboard so the note shows.
      Keyboard.dismiss();
      return;
    }
    if (next.code) {
      codeRef.current?.focus();
      return;
    }

    setBusy(true);
    setFrozenCount(profiles.length);
    const added = actions.addProfile({ name: trimmed, grade: chosenGrade, schoolCode: codeReady ? code : null });
    if (added) sfx.sparkle();
    router.push(ROUTES.profiles);
  };

  // "Next" on the keyboard: move on to the grade picker instead of submitting a half-filled form.
  const onNameSubmit = () => {
    if (!grade) Keyboard.dismiss();
    else submit();
  };

  const onNameChange = (next: string) => {
    setName(next);
    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
  };

  const onGradeChange = (value: string) => {
    setGrade(value);
    setErrors((prev) => ({ ...prev, grade: null }));
  };

  const onCodeChange = (value: string) => {
    setCode(value);
    if (value.length === 0 || value.length === CODE_LENGTH) setErrors((prev) => ({ ...prev, code: null }));
  };

  return {
    name, grade, code, errors, busy, nameRef, codeRef, showBack, avatar, hasName, codeReady,
    submit, onNameSubmit, onNameChange, onGradeChange, onCodeChange,
  };
}
